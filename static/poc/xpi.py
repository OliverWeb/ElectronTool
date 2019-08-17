#! /usr/bin/env python
# -*- coding: utf-8 -*-

'''
用于统一插件开发和给插件提供各种常用的函数
'''
import sys
import os
import base64
import urllib2
import json
import re
import urlparse
import socket
import struct
import urllib
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from concurrent import futures
import copy
import base64

reload(sys)
sys.setdefaultencoding("utf-8")

MAPX_ENV = {}
MAPX_ENV['DEBUG'] = False

# xpi_url = 'http://v4.mapx:8000'
# xpi_url = 'http://172.5.215.97:8803'
# 联动服务器的访问地址
xpi_url = 'http://10.1.1.226:8803'

xpi_url_hosts = xpi_url + '/mapx_hosts?act=get_mapx_hosts'
xpi_url_webs = xpi_url + '/domain?act=search'

# 调用KEY，使用调用KEY，可以免去登录，直接获取数据
MAPX_XPI_KEY = '123faa69-c756-40ee-ad98-2238269b1f12'


# MapX的POC基类,所有衍生的MapX的POC类都要继承自此基类
class MapXExploitsBase:
    info = {}

    def __init__(self):
        return

    def vulnerable(self, hostinfo):
        return

    def exploit(self, hostinfo):
        return


# V2版的针对WEB类POC的基础类
class MapXExploitsWebBaseV2(MapXExploitsBase):
    version = '2.0'

    def addToThreat(self, threat, url, grade):
        out = '[+][%s]%s:%s' % (grade, url, threat)
        print out
        return

    def log(self, text):
        print '[*]' + text


# V2版的针对服务类POC的基础类
class MapXExploitsHostsBaseV2(MapXExploitsBase):
    version = '2.0'

    def addToThreat(self, threat, assc, grade):
        out = '[+][%s]%s:%s' % (grade, assc, threat)
        print out
        return

    def log(self, text):
        print '[*]' + text

    def ip2long(self, ip):
        packedIP = socket.inet_aton(ip)
        return struct.unpack("!L", packedIP)[0]


# V3版的针对POC的基础类
class MapXExploitsBaseV3(MapXExploitsBase):
    version = '3.0'

    # 添加威胁到系统中
    def addToThreat(self, threat, assc, grade, solution):
        print '[+]目标:' + self.target['_id'] + ' 发现威胁'
        print '\t[威胁详情]' + threat
        print '\t[关联信息]' + assc
        print '\t[威胁等级]' + grade
        if solution != '':
            print '\t[解决方案]' + solution
        return

    # 记录日志
    def log(self, text):
        print '[*]' + text

    # 将ip地址转换为整数
    def ip2long(self, ip):
        packedIP = socket.inet_aton(ip)
        return struct.unpack("!L", packedIP)[0]

    # 　根据产品、服务、端口等获取相关的资产，各个条件之间是或的关系
    def getapps(self, products=[], ports=[], services=[]):
        forced_app = False
        if self.target.get('forced_app', False) == True:
            forced_app = True
        result = {'data': []}
        try:
            hostinfo = self.target
            result['addr'] = ip2long(hostinfo['addr'])
            openports = hostinfo['openports_raw']
            if openports['count'] == 0:
                return result
            hostip = hostinfo['addr']
            result['hostip'] = hostip.strip()

            hostip = hostip.strip()
            if hostip != '':
                for portinfo in hostinfo['openports']:
                    if portinfo.get('url', '') != '':
                        url = portinfo['url']
                    else:
                        port = portinfo['port']
                        url = hostip + ':' + str(port)
                    portinfo['url_root'] = getUrlRoot(url)
                    if products == [] and ports == [] and services == []:
                        result['data'].append(portinfo)
                    else:
                        if portinfo.get('service_product') in products:
                            result['data'].append(portinfo)
                        elif portinfo.get('service_name') in services:
                            result['data'].append(portinfo)
                        elif portinfo.get('port') in ports:
                            result['data'].append(portinfo)
                        elif forced_app:
                            result['data'].append(portinfo)
        except Exception as e:
            print e
            result = {'data': []}
        return result

    # 　添加应用，比如POC判断某个主机是Struts2，通过此函数可以将信息添加到资产库中
    def addApps(self, apps):
        try:
            print '[发现资产]' + json.dumps(apps)
        except:
            pass

        return


# 过滤utf-8的boom字符
def bomstrip(string):
    """
    Function to delete UTF-8 BOM character in "string"
    """

    if sys.version_info.major == 2:
        utf8bom = '\xef\xbb\xbf'
    elif sys.version_info.major == 3:
        utf8bom = b'\xef\xbb\xbf'
    else:
        raise 'This version of python is not supported.'

    if string[:3] == utf8bom:
        return (string[3:])
    else:
        return (string)


# 处理V4版的数据到兼容格式
def parseV4data(hosts):
    for host in hosts.get('data', []):
        host['addr'] = host['ip']
        host['_id'] = host.get('id')
        openports_raw = []
        openports = []
        for portinfo in host.get('host_assets', []):
            split_info = portinfo.get('host', '').split(':')
            if len(split_info) == 0:
                continue
            new_portinfo = {}
            if len(split_info) > 0:
                port = int(split_info[0])
                new_portinfo['port'] = port
                openports_raw.append(port)
            if len(split_info) > 1:
                new_portinfo['service_name'] = split_info[1]
            if len(split_info) > 2:
                new_portinfo['service_product'] = split_info[2]
            if len(split_info) > 3:
                new_portinfo['service_version'] = split_info[3]
            if len(split_info) > 4:
                new_portinfo['service_extrainfo'] = split_info[4]
            openports.append(new_portinfo)
        openports_raw = list(set(openports_raw))
        host['openports_raw'] = {'count': len(openports_raw), 'tcp': openports_raw}
        host['openports'] = openports

    return hosts


# 　联动服务器根据Mapx语法查询相关主机资产
def queryHosts(MapXQuery, lastchecktime='1987-10-12', start=0, size=10):
    hosts = {}

    q = 'lastupdatetime>="' + lastchecktime + '"' + ' && ' + '(' + MapXQuery + ')'
    q = q.encode('utf-8')
    qbase64 = base64.b64encode(q)
    # qbase64 = base64.b64encode('('+MapXQuery+')'+' && '+'lastupdatetime>="'+lastchecktime+'"')
    # postdata = '&mapx=' + urllib.quote(qbase64) + '&start_index=' + str(start) + \
    #           '&need_length=' + str(size) + '&filter={"asset":"","ip":"","port":[],"app_name":[],"probe_state":"","identify_state":"","tag_info":"","app_version":"","server":"","os":"","webtitle":"","header":"","body":"","warning":"","bug":"","fs_crack":"","city":[],"app_tag":[],"vendor":[],"probes":[],"date":[],"start_time":"","end_time":""}'
    postdata = {
        'mapx': qbase64,
        'start_index': str(start),
        'need_length': str(size),

        # 'filter':'{"asset":"","ip":"","port":[],"app_name":[],"probe_state":"","identify_state":"","tag_info":"","app_version":"","server":"","os":"","webtitle":"","header":"","body":"","warning":"","bug":"","fs_crack":"","city":[],"app_tag":[],"vendor":[],"probes":[],"date":[],"start_time":"","end_time":""}'
    }
    postdata = urllib.urlencode(postdata)
    # data = json.dumps(postdata)
    if MAPX_ENV['DEBUG']:
        proxy = urllib2.ProxyHandler({'http': '127.0.0.1:8000'})
        opener = urllib2.build_opener(proxy)
        urllib2.install_opener(opener, postdata)
    request = urllib2.Request(xpi_url_hosts, postdata)
    # print xpi_url_hosts+postdata
    request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
    request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
    request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
    request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
    response = urllib2.urlopen(request)
    jshosts = response.read()
    # jshosts = json.loads(jshosts)
    jshosts = bomstrip(jshosts)
    hosts = json.loads(jshosts)
    hosts = parseV4data(hosts)
    return hosts


# 　联动服务器根据Mapx语法查询相关网站资产
def queryWebs(MapXQuery, lastchecktime='1987-10-12', start=0, size=10, extra=[], jsonfmt=False):
    try:
        if lastchecktime == '':
            lastchecktime = '1987-10-12'
        # qbase64 = base64.b64encode('('+MapXQuery+')'+' && '+'lastupdatetime>="'+lastchecktime+'"')
        if jsonfmt:
            q = MapXQuery
        else:
            q = 'lastupdatetime>="' + lastchecktime + '"' + ' && ' + '(' + MapXQuery + ')'
        q = q.encode('utf-8')
        qbase64 = base64.b64encode(q)
        postdata = '&qbase64=' + urllib.quote(qbase64) + '&start=' + str(start) + \
                   '&length=' + str(size)
        for ext in extra:
            postdata = postdata + '&extra[]=' + ext
        if jsonfmt:
            postdata = postdata + '&json=1'
            postdata = postdata + '&lastupdatetime=' + lastchecktime
        if MAPX_ENV['DEBUG']:
            proxy = urllib2.ProxyHandler({'http': '127.0.0.1:8080'})
            opener = urllib2.build_opener(proxy)
            urllib2.install_opener(opener)
        # print postdata
        request = urllib2.Request(xpi_url_webs + postdata)
        request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
        request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
        request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
        # ctx = ssl._create_unverified_context()
        # response = urllib2.urlopen(request,context=ctx)
        response = urllib2.urlopen(request)
        jshosts = response.read()
        # print jshosts
        jshosts = bomstrip(jshosts)
        # print jshosts
        hosts = json.loads(jshosts)
        # print jshosts
    except:
        hosts = {}
    # hosts = json.loads(jshosts)
    return hosts


# 获取主机名或域名对应的ip地址
def get_ip_of_host(host):
    try:
        myaddr = socket.gethostbyname(host)
    except:
        myaddr = None
    return myaddr


# 　格式化url，将url标准化处理，并可以输出端口、ip、域名、根url等
def parseUrl(url):
    result = {}
    if url.find('http') != 0:
        url = 'http://' + url
    result['url'] = url
    parsed_uri = urlparse.urlparse(url)
    result['scheme'] = parsed_uri.scheme
    result['domain'] = parsed_uri.hostname
    result['ip'] = get_ip_of_host(result['domain'])
    if parsed_uri.port == None:
        if result['scheme'] == 'http':
            result['port'] = 80
        elif result['scheme'] == 'https':
            result['port'] = 443
        else:
            # 错误的url格式
            return {}
    else:
        result['port'] = parsed_uri.port
    result['username'] = parsed_uri.username
    result['password'] = parsed_uri.password
    path = '{uri.path}'.format(uri=parsed_uri)
    result['path'] = path
    path_split = os.path.split(path)
    path_dir = path_split[0]
    if (path_dir == ''):
        path_dir = '/'
    result['path_dir'] = path_dir
    result['path_file'] = path_split[1]
    result['query'] = parsed_uri.query
    result['uri'] = path
    return result


# 获取url的根url
def getUrlRoot(url):
    try:
        u = parseUrl(url)
        if u == {} or u == None:
            raise
        url_root = u['scheme'] + '://'
        if u['username'] != None and u['password'] != None:
            url_root = url_root + u['username'] + ':' + u['password'] + '@'
        url_root = url_root + u['domain']
        if (u['port'] == 80) and (u['scheme'] == 'http'):
            pass
        elif (u['port'] == 443) and (u['scheme'] == 'https'):
            pass
        else:
            url_root = url_root + ':' + str(u['port'])
    except:
        url_root = ''
    return url_root


# 获取文件内容到列表
def file2list(file):
    iplist = []
    try:
        fh = open(file)
        for ip in fh.readlines():
            ip = ip.strip()
            iplist.append(ip)
        fh.close()
        return iplist
    except Exception, e:
        print e


# 获取弱口令字典
def getdics(dic_type):
    if dic_type in ['users_passwords', 'mysql', 'ftp', 'mssql', 'ldapd',
                    'mongodb', 'pop3', 'postgres', 'rsync', 'smb', 'snmp',
                    'ssh', 'tomcat', 'vnc', 'web', 'users', 'passwords']:
        if os.path.exists('../conf/'):
            return file2list('../conf/' + dic_type + '.dic')
        elif os.path.exists('./conf/'):
            return file2list('./conf/' + dic_type + '.dic')
        else:
            return []
    elif dic_type == '#':
        return []
    else:
        return []


# 将ip地址转换为整数
def ip2long(ip):
    packedIP = socket.inet_aton(ip)
    return struct.unpack("!L", packedIP)[0]


# 根据ip和端口，生成脚本兼容格式的资产数据
def generate_manual_host(ip, ports):
    info = {}
    info['_id'] = ip
    info['host'] = ip
    info['addr'] = ip
    info['openports'] = []
    info['openports_raw'] = {'tcp': {'ports': []}}
    for portinfo in ports:
        info['openports_raw']['tcp']['ports'].append(portinfo['port'])
        info_t = {}
        service_name = portinfo.get('service_name', '')
        if service_name != '':
            info_t['service_name'] = service_name
        service_product = portinfo.get('service_product', '')
        if service_product != '':
            info_t['service_product'] = service_product
        if portinfo.get('url', '') != '':
            info_t['url'] = portinfo.get('url', '')
        if portinfo.get('host', '') != '':
            info_t['host'] = portinfo.get('host', '')
        port = portinfo.get('port', 0)
        if port != 0:
            info_t['port'] = port
        if info_t != {}:
            info['openports'].append(info_t)
    info['openports_raw']['count'] = len(info['openports_raw']['tcp']['ports'])
    return info


# 将web资产转换为主机资产格式
def transweb2host(web):
    result = None
    try:
        urlhost = (web.get('host') + ':').split(':')
        host = urlhost[0]
        if host == '':
            raise
        port = urlhost[1]
        if port == '':
            port = 80
        else:
            port = int(port)
        ports = []
        for app in web['apps']:
            portinfo = {}
            portinfo['port'] = port
            # {'service_product':'Docker remote API','port':2375}
            portinfo['service_name'] = 'web'
            portinfo['host'] = web.get('host')
            portinfo['url'] = web.get('url')
            portinfo['service_product'] = app['name']
            ports.append(portinfo)
        result = generate_manual_host(web['ip'], ports)
    except:
        result = None
    return result


# 将整数转换为ip地址
def long2ip(ip):
    return socket.inet_ntoa(struct.pack("!I", ip))


# 调用接口新建管理与
def engine_group_add(group_name, ips, urls):
    result = False
    try:
        data = {}
        data['name'] = group_name
        ips_str = ''
        for ipr in ips:
            if ips_str != '': ips_str = ips_str + '\n'
            ips_str = ips_str + long2ip(ipr[0]) + '-' + long2ip(ipr[1])
        data['hosts'] = ips_str
        url_str = ''
        for url in urls:
            if url_str != '': url_str = url_str + '\n'
            url_str = url_str + url
        data['urls'] = url_str
        request = urllib2.Request(xpi_url + '/grouping?act=group_add', urllib.urlencode(data))
        request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
        request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
        request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
        response = urllib2.urlopen(request)
        jsres = response.read()
        jsres = bomstrip(jsres)
        res = json.loads(jsres)
        if res.get('code', 0) == 1:
            result = res['ids'][0]
    except Exception as e:
        print e
    return result


# 调用接口新建任务
def engine_finder_task_add(task_name, groups, ports):
    result = False
    try:
        data = {}
        data['name'] = task_name
        data['cycle'] = '一次'
        data['engine_id'] = 'default'
        data['highmode'] = 'off'
        data['scan_delay'] = ''
        data['scan_ping'] = 'on'
        port_str = ''
        for port in ports:
            if port_str != '': port_str = port_str + ','
            port_str = port_str + str(port)
        data['scan_ports'] = port_str
        post_data_str = urllib.urlencode(data)
        for group in groups:
            post_data_str = post_data_str + '&ids[]=' + group
        # data['ids[]'] = groups
        request = urllib2.Request(xpi_url + '/detect?act=detect_add', post_data_str)
        request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
        request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
        request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
        response = urllib2.urlopen(request)
        jsres = response.read()
        jsres = bomstrip(jsres)
        res = json.loads(jsres)
        if res.get('code', 0) == 1:
            result = res['ids'][0]
    except Exception as e:
        print e
    return result


# 调用接口新建资产侦测任务
def engine_finder_task_start(task_id):
    result = False
    try:
        data = {}
        data['id'] = task_id
        post_data_str = urllib.urlencode(data)
        proxy = urllib2.ProxyHandler({'http': '127.0.0.1:8080'})
        opener = urllib2.build_opener(proxy)
        urllib2.install_opener(opener)
        request = urllib2.Request(xpi_url + '/detect?act=detect_refresh', post_data_str)
        request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
        request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
        request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
        response = urllib2.urlopen(request)
        jsres = response.read()
        jsres = bomstrip(jsres)
        res = json.loads(jsres)
        result = res.get('code', 0) == 1
    except Exception as e:
        print e
    return result


# 获取任务状态
def engine_finder_task_status(task_id):
    result = False
    try:
        data = {}
        data['qbase64'] = base64.b64encode('id="' + task_id + '"')
        get_data_str = urllib.urlencode(data)
        proxy = urllib2.ProxyHandler({'http': '127.0.0.1:8080'})
        opener = urllib2.build_opener(proxy)
        urllib2.install_opener(opener)
        request = urllib2.Request(xpi_url + '/detect?act=detect_search' + '&' + get_data_str)
        request.add_header('MAPX-XPI-KEY', MAPX_XPI_KEY)
        request.add_header('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8')
        request.add_header('Authorization', 'Basic bWFweDphbnl1bnRlY0AxMjM=')
        request.get_method = lambda: 'POST'  # 设置HTTP的访问方式
        response = urllib2.urlopen(request)
        jsres = response.read()
        jsres = bomstrip(jsres)
        res = json.loads(jsres)
        tasks = res.get('data', [])
        for task in tasks:
            if task.get('id', '') == task_id:
                result = task
                break
    except Exception as e:
        print e
    return result


# 　自动化调试函数，自动根据POC设置的query字段的mapx语法，联动服务器获取资产，并调用POC进行验证
def main_auto(exp, threads=1, task_id=''):
    if isinstance(exp, MapXExploitsHostsBaseV2):
        hosts = queryHosts(exp.info['query'])
        for host in hosts['data']:
            exp.target = host
            exp.vulnerable()
    elif isinstance(exp, MapXExploitsWebBaseV2):
        webs = queryWebs(exp.info['query'])
        for web in webs['data']:
            exp.target = host
            exp.vulnerable()
    elif isinstance(exp, MapXExploitsBaseV3):
        if not hasattr(exp, 'options'):
            exp.options = {}
        start = exp.options.get('start', 0)
        length = exp.options.get('length', 10)
        print '[*]正在从资产服务器检索相关网站数据'
        webs = queryWebs(exp.info['query'])
        print '[*]检索到' + str(len(webs.get('data', []))) + '条数据'
        poc_threads = []
        targets = []
        for web in webs.get('data', []):
            target = transweb2host(web)
            targets.append(target)
            # exp.vulnerable()
        print '[*]相关数据检测完毕'
        print '[*]正在从资产服务器检索相关主机数据'
        hosts = queryHosts(exp.info['query'], lastchecktime='1987-10-12', start=start, size=length)
        print '[*]检索到' + str(len(hosts.get('data', []))) + '条数据'
        for host in hosts.get('data', []):
            exp.target = host
            targets.append(host)
            # exp.vulnerable()
        pool = ThreadPoolExecutor(max_workers=threads)
        poc_futures = []
        for target in targets:
            new_exp = copy.deepcopy(exp)
            new_exp.target = target
            poc_futures.append(pool.submit(new_exp.vulnerable))
            # future.result()
        for future in futures.as_completed(poc_futures):
            pass
        print '[*]相关数据检测完毕'
    return


# 手动调试函数，针对WEB类POC，仅需要输入问题url
def main_manual_data_by_url(exp, url, threads=1, task_id=''):
    u = parseUrl(url)
    info = {}
    info['port'] = u['port']
    info['service_name'] = 'web'
    info['host'] = url
    info['url'] = url
    exp.target = generate_manual_host(u['ip'], [info])
    exp.target['forced_app'] = True
    exp.vulnerable()


# 手动调试函数，针对服务类POC，仅需要输入问题ip ，端口
def main_manual_data_ip_port(exp, ip, port, threads=1, task_id=''):
    info = {}
    info['port'] = port
    info['service_name'] = 'web'
    info['host'] = ip + ':' + str(port)
    info['url'] = ip + ':' + str(port)
    exp.target = generate_manual_host(ip, [info])
    exp.target['forced_app'] = True
    exp.vulnerable()


# 手动调试函数，针对服务类POC，仅需要输入问题ip ，端口　列表
# def main_manual_data_ip_port(exp, infile, threads=1, task_id=''):
#     info = {}
#     info['port'] = port
#     info['service_name'] = 'web'
#     info['host'] = ip + ':' + str(port)
#     info['url'] = ip + ':' + str(port)
#     exp.target = generate_manual_host(ip, [info])
#     exp.target['forced_app'] = True
#     exp.vulnerable()


if __name__ == '__main__':
    a = queryHosts('app="Ubuntu"', lastchecktime='1987-10-12', start=0, size=10)
    print(a)

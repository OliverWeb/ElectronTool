# !/usr/bin/env python
# -*- coding:utf-8 -*-

# 请使用python2方式编写本文件
# ***弱口令漏洞文件***

import xpi
import sys
import pprint
import requests
import re

if sys.version > '3':
    import imp

    imp.reload(sys)
else:
    reload(sys)
    sys.setdefaultencoding("utf-8")

solutions = dict()
solutions[''] = ''  # 请在此处填入漏洞解决方案文字描述


def check(url):
    # 弱口令漏洞处理主函数（请在此函数内填入漏洞处理逻辑）
    results = [["xxx", "xxx"], ["xxx", "xxx"]]
    return results  # 请返回上述格式的数据，如需定制，请修改MapXExploits类中check函数相应逻辑


class MapXExploits(xpi.MapXExploitsBaseV3):
    def __init__(self):
        self.info = {
            "uuid": '{mapx: poc_id}',
            "info_id": '{mapx: info_id}',
            "author": '{mapx: author}',
            "description": """{mapx: description}""",
            "format": 'mapx',
            "query": '{mapx: query}',
            "product": '{mapx: product}',
            "productLink": '',
            "createDate": '{mapx: createDate}',
            "updateDate": '{mapx: updateDate}',
            "asscid": [''],
            "reference": [''],
            "vuldate": '',
            "vulfile": '',
            "vultype": '{mapx: vultype}',
            "name": '{mapx: name}',
            "type": 'hosts'
        }
        return

    def check(self, ip, port, url_root):
        try:
            r = check(url_root)
            if (not isinstance(r,list)) or (r == []):
                print ('failed')
            else:
                for rr in r:
                    self.addToThreat('{mapx: name} %s:%s' %(rr[0],rr[1]), url_root, '{mapx: level}', solutions[''])
                print('success')
        except Exception as e:
            print('Error:', e)

    def vulnerable(self):
        apps = self.getapps(products=['{mapx: query_list}'], ports=[], services=[''])
        pprint.pprint(apps)
        for app in apps['data']:
            self.check(apps.get('hostip'), app.get('port'), app.get('url_root'))
        return


def main():
    exp = MapXExploits()
    xpi.main_manual_data_by_url(exp, 'http://www.baidu.com')  # 可将http://www.baidu.com替换为待测试目标url地址
    # xpi.main_auto(exp)


if __name__ == '__main__':
    # 用户如需运行本文件，需下载xpi.py文件，并将main.py文件与xpi.py文件放置在同一目录下，运行main.py文件
    main()
    print('end')

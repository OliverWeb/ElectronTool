# -*-coding:utf-8 -*-
import os
import imp
import traceback
import sys
import os.path
import getopt

import xpi


def check_poc(type, poc_path, url, ip, port):
    """
    导入main.py环境，运行poc文件，记录返回结果
    """
    try:
        main_count = 0
        g = os.walk(poc_path)
        for p_path, dir_list, file_list in g:
            for file in file_list:
                if file == "main.py":
                    # 导入Poc到环境
                    main_count += 1
                    main_path = "{0}/{1}".format(poc_path, file)
                    imp.load_source('env', main_path)
                    import env
                    exp = env.MapXExploits()

                    if type == "check_format":
                        print("check format target: {0}/main.py result: ".format(poc_path))
                        xpi.main_manual_data_by_url(exp, url)
                        print("check format target: {0}/main.py result: ".format(poc_path))
                        xpi.main_manual_data_ip_port(exp, ip, port)
                        res = env.check(url)
                        return res
                    else:
                        if url:
                            print("detect target: {0} result: ".format(url))
                            xpi.main_manual_data_by_url(exp, url)
                        else:
                            print("detect target: {0}:{1} result: ".format(ip, port))
                            xpi.main_manual_data_ip_port(exp, ip, port)
                        return
        if main_count != 1:
            raise ValueError(str("only one main.py file can be contained in poc folder"))
    except Exception as e:
        is_ok = False
        if type == "check_format" and str(e) == 'check() takes exactly 2 arguments (1 given)':
            try:
                # check 接受 ip 和 port Poc到环境
                imp.load_source('env', main_path)
                import env
                check_res = env.check(ip, port)
                is_ok = True
                return check_res
            except:
                format_e = traceback.format_exc()
                return format_e
        if is_ok is False:
            format_e = traceback.format_exc()
            return format_e


def get_check_result(poc_path, type, test_url, test_ip, test_port):
    """
    poc检测入口函数
    :param poc_path: poc_id文件夹路径
    :param test_url: 测试url
    :param test_ip: 测试ip
    :param test_port: 测试port
    :return: True/Error
    """
    if not os.path.exists(poc_path):
        raise ValueError("poc folder: {0} is not exist".format(poc_path))
    try:
        check_res = check_poc(type, poc_path, test_url, test_ip, test_port)
    except Exception as e:
        raise ValueError(str(e))
    return check_res


if __name__ == '__main__':
    # 添加终端运行参数
    try:
        args = sys.argv[1:]
        opts, args = getopt.getopt(args, "h:", ["help", "type=", "path=", "url=", "ip=", "port="])
    except getopt.GetoptError:
        print('**Error****************************************')
        print('  Help: python2 check_poc.py --help')
        print('    or: python2 check_poc.py -h')
        print('Format: python2 check_poc.py --type check_format(default)/detect_uri --path poc_path --url test_url')
        print('    or: python2 check_poc.py --type check_format(default)/detect_uri --path poc_path --ip test_ip --port test_port')
        sys.exit(2)
    type = "check_format"
    poc_path = ""
    test_url = ""
    test_ip = ""
    test_port = 0
    for opt, arg in opts:
        if opt in {"-h", "--help"}:
            print('Format: python2 check_poc.py --path poc_path --url test_url')
            print('    or: python2 check_poc.py --path poc_path --ip test_ip --port test_port')
            sys.exit()
        elif opt in {"--type"}:
            type = arg
        elif opt in {"--path"}:
            poc_path = arg
        elif opt in {"--url"}:
            test_url = arg
        elif opt in {"--ip"}:
            test_ip = arg
        elif opt in {"--port"}:
            test_port = arg
        else:
            print('param error')
            sys.exit()

    if not poc_path:
        print('path param must be required')
        sys.exit()
    if not os.path.exists("{0}/main.py".format(poc_path)):
        print('main.py file is not exist in input path')
        sys.exit()

    if type == "check_format":
        if test_url:
            # 传test_url
            if not (test_ip and test_port):
                # test_ip、test_port都没传，使用百度进行检测
                test_ip = "61.135.169.125"
                test_port = 80
            elif (not test_ip) and test_port:
                # 传test_port，没传test_ip，使用百度ip
                test_ip = "61.135.169.125"
            elif (not test_port) and test_ip:
                # 传test_ip，没传test_port，使用80端口
                test_port = 80
            else:
                # 传test_ip、test_port
                pass
        else:
            # 没传test_url
            if not (test_ip and test_port):
                # test_url、test_ip、test_port都没传，使用百度进行检测
                test_url = "http://www.baidu.com"
                test_ip = "61.135.169.125"
                test_port = 80
            elif (not test_ip) and test_port:
                # 传test_port，没传test_ip，使用百度ip
                test_ip = "61.135.169.125"
            elif (not test_port) and test_ip:
                # 传test_ip，没传test_port，使用80端口
                test_port = 80
            else:
                # 传test_ip、test_port
                pass
    elif type == "detect_uri":
        if test_url:
            # 传test_url
            if test_ip or test_port:
                # 传test_url，且传test_ip或test_port
                print('test_ip or test_port param is not required')
                sys.exit()
            test_ip = None
            test_port = None
        else:
            # 没传test_url
            if not (test_ip or test_port):
                # test_url没传，test_ip或test_port也没传
                print('test_ip and test_port param must be required')
                sys.exit()
            else:
                test_url = None
    else:
        print('type param error')
        sys.exit()

    if type == "check_format":
        print('**********Test poc:{0}/main.py availability**********'.format(poc_path))
    else:
        if test_url:
            print('**********Detect target:{0} using {1}/main.py**********'.format(test_url, poc_path))
        else:
            print('**********Detect target:{0}:{1} using {2}/main.py**********'.format(test_ip, test_port, poc_path))
    result = get_check_result(
        type=type, poc_path=poc_path, test_url=test_url, test_ip=test_ip, test_port=test_port
    )

    # result = get_check_result(
    #     type="detect_uri", poc_path=".", test_url=None, test_ip="10.1.1.226", test_port=8000
    # )
    if type == "check_format":
        print("check function result: {0}".format(result))
    else:
        if result is None:
            print("detect finished")
        else:
            print("detect error: {0}".format(result))


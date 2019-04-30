import sys, json
from threading import Timer


class LongRunningProcess:
    def __init__(self):
        self.sure = True

    def work(self,func,san):
        sys.stdout.write("Working Hard..\n")
        sys.stdout.flush()
        self.setInterVal(func, san)

    def setInterVal(self,func, san):
        def func_Calistir():
            func(func,san)
            
        self.t = Timer(san, func_Calistir)
        self.t.start()
        return self.t

    def stop(self):
        self.t.cancel()

    
def read_in():
    command = sys.stdin.readlines()
    return command[0]


def main():
    a = LongRunningProcess()
    a.setInterVal(a.work,1)
    command = read_in()
    if(command == "STOP"):
        a.stop()
        

#start process
if __name__ == '__main__':
    main()
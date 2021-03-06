import { ICommand, ICmd } from "./ICommand";
import IRegister from "./IRegister";

export default (text: string) => {
  let registers: Array<IRegister> = [
    {
      name: "EAX",
      value: 0,
      register: true,
      pointingTo: undefined
    },
    {
      name: "EBX",
      value: 0,
      register: true,
      pointingTo: undefined
    },
    {
      name: "ECX",
      value: 0,
      register: true,
      pointingTo: undefined
    },
    {
      name: "EDX",
      value: 0,
      register: true,
      pointingTo: undefined
    },
    {
      name: "EDI",
      value: 0,
      register: true,
      pointingTo: undefined
    },
  ];
  const lines: Array<string> = text.split("\n");
  let data = false;
  let code = false;
  let currentBlock: string;
  let codes: Array<ICommand> = [];
  lines.forEach((line, lineIdx) => {
    // Parsing data
    if (data) {
      line = removeWhiteSpace(line);
      let args: Array<string> = line.replace(/,/g, "").split(" ");
      let name: string = args.shift()!;
      args.shift();
      registers.push({ name, value: args, register: false, pointingTo: undefined });
    }

    // Parsing the code
    else if (code) {
      if (line.includes("end main")) {
        code = false;
      }
      if (!currentBlock) {
        currentBlock = "main";
        codes.push({ key: currentBlock, cmds: [] });
      } else {
        // A new block would end in a ':'
        if (line.substr(line.length - 1) === ":") {
          currentBlock = line.substr(0, line.length - 1);
          codes.push({ key: currentBlock, cmds: [] });
        } else {
          let found = codes.find((x) => x.key === currentBlock)!;

          line = removeWhiteSpace(line);
          // Let's get rid of comments => denoted by ';'
          let idx = line.indexOf(";");
          let cmd: ICmd = {
            cmd: idx > -1 ? line.substr(0, idx) : line,
            lineNo: lineIdx + 1,
          };
          found.cmds.push(cmd);
        }
      }
    }

    if (line.includes(".data")) {
      data = true;
    } else if (line.includes(".code")) {
      data = false;
      code = true;
    }
  });

  // Remove any empty commands
  codes = codes.map((c: ICommand) => {
    return { ...c, cmds: c.cmds.filter((cmd: ICmd) => cmd.cmd !== "") };
  });
  registers.pop();
  return { registers, codes };
};

const removeWhiteSpace = (message: string) => {
  // Let's remove all spaces and tabs from the start of the string!
  let i = 0;
  for (; i < message.length; i++) {
    if (message.charAt(i) !== " " && message.charAt(i) !== "	") break;
  }
  return message.substr(i, message.length);
};

import ICommand from "./ICommand";
import IRegister from "./IRegister";

let registers: Array<IRegister> = [
  {
    name: "EAX",
    value: 0,
  },
  {
    name: "EBX",
    value: 0,
  },
  {
    name: "ECX",
    value: 0,
  },
  {
    name: "EDX",
    value: 0,
  },
  {
    name: "EDI",
    value: 0,
  },
];

export default (text: string) => {
  const lines: Array<string> = text.split("\n");
  let data = false;
  let code = false;
  let currentBlock: string;
  const vars: Array<IRegister> = [];
  const codes: Array<ICommand> = [];
  lines.forEach((line) => {
    // Parsing data
    if (data) {
      line = removeWhiteSpace(line);
      let args: Array<string> = line.replace(/,/g, "").split(" ");
      let name: string = args.shift()!;
      args.shift();
      vars.push({ name, value: args });
    }

    // Parsing the code
    else if (code) {
      if (line.includes("end main")) {
        code = false;
      }
      if (!currentBlock) {
        currentBlock = "main";
        codes.push({key: currentBlock, cmds: []})
      } else {
        // A new block would end in a ':'
        if (line.substr(line.length - 1) === ":") {
          currentBlock = line.substr(0, line.length - 1);
          codes.push({key: currentBlock, cmds: []});
        } else {
          let found = codes.find((x) => x.key === currentBlock)!;

          line = removeWhiteSpace(line);
          // Let's get rid of comments => denoted by ';'
          let idx = line.indexOf(";");
          found.cmds.push(idx === 0 ? line.substr(0, idx) : line);
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

  vars.pop();

  console.log(codes);
  return { vars, registers, codes };
};

const removeWhiteSpace = (message: string) => {
  // Let's remove all spaces and tabs from the start of the string!
  let i = 0;
  for (; i < message.length; i++) {
    if (message.charAt(i) !== " " && message.charAt(i) !== "	") break;
  }
  return message.substr(i, message.length);
};

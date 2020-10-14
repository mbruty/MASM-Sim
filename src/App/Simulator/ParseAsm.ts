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
  const vars: Array<IRegister> = [];
  const codes: Array<string> = [];
  lines.forEach((line) => {
    if (data) {
      // Let's remove all spaces and tabs from the start of the string!
      let i = 0;
      for (; i < line.length; i++) {
        if (line.charAt(i) !== " " && line.charAt(i) !== "	") break;
      }
      line = line.substr(i, line.length);
      console.log(line);
      let args: Array<string> = line.replace(/,/g, "").split(" ");
      let name: string = args.shift()!;
      args.shift();
      vars.push({ name, value: args });
    } else if (code) {
      if (line.includes("end main")) {
        code = false;
      }
      codes.push(line);
    }

    if (line.includes(".data")) {
      data = true;
    } else if (line.includes(".code")) {
      data = false;
      code = true;
    }
  });

  vars.pop();

  return { vars, registers };
};

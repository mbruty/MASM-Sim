import { ICmd, ICommand } from "./ICommand";
import IRegister from "./IRegister";
const StringMath = require("string-math");

export default (programState: any, setProgramState: (state: any) => void) => {
  const [instruction, ...params] = programState.nextCmd.cmd.split(" ");

  switch (instruction.toLowerCase()) {
    case "mov":
      // Remove the trailing ,
      params[0] = params[0].substr(0, params[0].length - 1);
      // Get the second variable to move in to the first variable
      let toMove = findAndGet(programState.registers, params[1]);
      if (toMove.length === 0) {
        // Array access - not finished
        if (params[1].charAt(0) === "[") {
          let register: string = params[1].substr(1, params[1].length - 1);
          let index = findAndGet(
            programState.registers,
            params[3].toUpperCase()
          )[0].value;
          toMove = findAndGet(programState.registers, register)[0].value[index];
        } else if (params[1].toUpperCase() === "LENGTHOF") {
          let value = findAndGet(programState.registers, params[2])[0];
          let equation: string =
            value.value.length + " " + params.slice(3, params.length).join(" ");
          toMove = StringMath(equation);
        } else {
          toMove = params[1];
        }
      }
      let stateCopy = { ...programState };
      stateCopy.registers = findAndSet(programState.registers, params[0].toUpperCase(), toMove);
      stateCopy.nextCmd = stateCopy.codes
        .filter((x: ICommand) => x.key === stateCopy.blockKey)[0]
        .cmds.filter((x: ICmd) => x.lineNo === stateCopy.currentLine + 1)[0];
      stateCopy.currentLine = stateCopy.currentLine + 1;
      setProgramState(stateCopy);
      break;
    case "jmp":
      // Find next clode block
      const nextBlock = programState.codes.filter(
        (x: ICommand) => x.key === params[0]
      )[0];

      // Set

      setProgramState({
        ...programState,
        blockKey: nextBlock.key,
        currentLine: nextBlock.cmds[0].lineNo,
        nextCmd: nextBlock.cmds[0],
      });
      break;
    case "cmp":
      break;
    default:
      setProgramState({ ...programState, error: true });
  }
};

const findAndSet = (registers: Array<IRegister>, toFind: string, val: any) => {
  // Find and set the value
  return registers.map((reg) => {
    if (reg.name === toFind) {
      return { ...reg, value: val };
    }
    return reg;
  });
};

const findAndGet = (registers: Array<IRegister>, toFind: string) => {
  return registers.filter((reg) => reg.name === toFind);
};

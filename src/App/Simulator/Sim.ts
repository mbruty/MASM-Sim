import { ICmd, ICommand } from "./ICommand";
import IRegister from "./IRegister";
const StringMath = require("string-math");

export default (programState: any, setProgramState: (state: any) => void) => {
  const [instruction, ...params] = programState.nextCmd.cmd.split(" ");
  let stateCopy = { ...programState };

  const goToNextLine = () => {
    stateCopy.nextCmd = findNextCode(
      programState.codes,
      programState.blockKey,
      programState.currentLine
    );
    stateCopy.currentLine = stateCopy.nextCmd.lineNo;
    setProgramState(stateCopy);
  };
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
        } else if (params.includes("LENGTHOF") || params.includes("lengthof")) {
          toMove = getLengthOf(programState.registers, params);
        } else {
          toMove = params[1];
        }
      }
      stateCopy.registers = findAndSet(
        programState.registers,
        params[0].toUpperCase(),
        toMove,
        null
      );
      goToNextLine();
      break;
    case "jmp":
      jumpToBlock(programState, setProgramState, params[0]);
      break;
    case "cmp":
      let first;
      if (params.includes("lengthof") || params.includes("LENGTHOF")) {
        getLengthOf(programState.registers, params);
      } else {
        first = findAndGet(
          programState.registers,
          params[0].substr(0, params[0].length - 1).toUpperCase()
        )[0].value;
      }
      let second = findAndGet(
        programState.registers,
        params[1].toUpperCase()
      )[0].value;
      stateCopy.comparrison.valOne = first;
      stateCopy.comparrison.valTwo = second;
      if (first === second) {
        stateCopy.comparrison.result = "equal";
      } else if (isNaN(first) || isNaN(second)) {
        stateCopy.comparrison.result = "not equal";
      } else if (Number(first) < Number(second)) {
        stateCopy.comparrison.result = "less than";
      } else if (Number(first) > Number(second)) {
        stateCopy.comparrison.result = "greater than";
      } else {
        stateCopy.comparrison.result = "not equal";
      }
      goToNextLine();
      break;
    case "jne":
      // If the previous comparrison was not equal
      if (programState.comparrison.result === "not equal") {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "je" || "jz":
      // If the previous comparrison was equal
      if (programState.comparrison.result === "equal") {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "jg" || "jnle" || "jae" || "jnbe":
      // If the previous comparrison was greater than
      if (programState.comparrison.result === "greater than") {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "jge" || "jnl" || "jae" || "jnb":
      // If the previous comparrison was greater than or equal
      if (
        programState.comparrison.result === "greater than" ||
        programState.comparrison.result === "equal"
      ) {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "jl" || "jnge" || "jb" || "jnae":
      // If the previous comparrison was less than
      if (programState.comparrison.result === "less than") {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "jle" || "jng" || "jbe" || "jna":
      // If the previous comparrison was less than or equal
      if (
        programState.comparrison.result === "less than" ||
        programState.comparrison.result === "equal"
      ) {
        // Jump
        jumpToBlock(programState, setProgramState, params[0]);
      } else {
        goToNextLine();
      }
      break;
    case "inc":
      stateCopy.registers = findAndSet(
        programState.registers,
        params[0],
        null,
        "inc"
      );
      goToNextLine();
      break;
    case "dec":
      stateCopy.registers = findAndSet(
        programState.registers,
        params[0],
        null,
        "dec"
      );
      goToNextLine();
      break;
    case "ret":
      // End the program
      setProgramState({...programState, reset: true});
      break;
    default:
      setProgramState({ ...programState, error: true });
  }
};

const findAndSet = (
  registers: Array<IRegister>,
  toFind: string,
  val: any | null,
  operation: string | null
) => {
  // Find and set the value
  return registers.map((reg) => {
    if (reg.name === toFind) {
      if (operation === "inc") return { ...reg, value: reg.value + 1 };
      else if (operation === "dec") return { ...reg, value: reg.value - 1 };
      return { ...reg, value: val };
    }
    return reg;
  });
};

const findAndGet = (registers: Array<IRegister>, toFind: string) => {
  return registers.filter((reg) => reg.name === toFind);
};

const findNextCode = (
  code: Array<ICommand>,
  blockKey: string,
  currentLine: any
) => {
  return code
    .filter((x: ICommand) => x.key === blockKey)[0]
    .cmds.filter((x: ICmd) => x.lineNo === currentLine + 1)[0];
};

const jumpToBlock = (
  programState: any,
  setProgramState: (newState: any) => void,
  key: string
) => {
  const nextBlock = programState.codes.filter(
    (x: ICommand) => x.key === key
  )[0];

  // Set
  setProgramState({
    ...programState,
    blockKey: nextBlock.key,
    currentLine: nextBlock.cmds[0].lineNo,
    nextCmd: nextBlock.cmds[0],
  });
};

const getLengthOf = (
  registers: Array<IRegister>,
  params: Array<any>
) => {
  let results = [] as Array<any>;
  for(let i = 0; i < params.length; i++) {
    if(params[i].toUpperCase().startsWith('LENGTHOF')){
    }
  }
  // let value = findAndGet(registers, params[2])[0];
  // if (params.length > 1) {
  //   let equation: string =
  //     value.value.length + " " + params.slice(3, params.length).join(" ");
  //   return StringMath(equation);
  // } else return value.value.length;
};

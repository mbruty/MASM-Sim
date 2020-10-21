import { isBreakStatement } from "typescript";
import { ICmd, ICommand } from "./ICommand";
import IRegister from "./IRegister";
const StringMath = require("string-math");

export default (
  programState: any,
  setProgramState: (state: any) => void,
  setLocked: (state: boolean) => void,
  setStarted: (state: boolean) => void
) => {
  let [instruction, ...params] = programState.nextCmd.cmd.split(" ");
  let stateCopy = { ...programState };
  params = params.filter((p: any) => p.toUpperCase() !== "TYPE" && p !== "");

  const end = () => {
    setLocked(false);
    setStarted(false);
    setProgramState({ ...programState, reset: true });
  };

  const goToNextLine = () => {
    stateCopy.nextCmd = findNextCode(
      programState.codes,
      programState.blockKey,
      programState.currentLine,
      end
    );
    if (stateCopy.nextCmd) {
      stateCopy.currentLine = stateCopy.nextCmd.lineNo;
      setProgramState(stateCopy);
    }
  };
  switch (instruction.toLowerCase()) {
    case "mov":
      // Remove the trailing ,
      if (params[0].charAt(0) !== "[")
        params[0] = params[0].substr(0, params[0].length - 1);
      // Get the second variable to move in to the first variable
      let toMove: any;
      console.log(params);

      if (!isNaN(parseInt(params[1], 10))) {
        toMove = parseInt(params[1], 10);
      }
      // First arg is array access
      // DO THIS FIRST THING TOMORROW PLEASE THANK YOU
      else if (params[0].charAt(0) === "[") {
        console.log("Here");

        let register: string = params[0].substr(1, params[0].length);

        let index = params[params.length - 2].substr(
          0,
          params[params.length - 2].length - 2
        );
        if (isNaN(parseInt(index, 10))) {
          index = findAndGet(
            programState.registers,
            params[params.length - 2]
              .substr(0, params[params.length - 2].length - 2)
              .toUpperCase()
          ).value;
        }
        let val = findAndGet(programState.registers, params[params.length - 1])
          .value;
        console.log(val);

        stateCopy.registers = findAndSetAtIndex(
          programState.registers,
          register,
          val,
          index
        );

        goToNextLine();
        break;
      } // Array access
      else if (params[1].charAt(0) === "[") {
        console.log(params);

        let register: string = params[1].substr(1, params[1].length);
        let array = findAndGet(programState.registers, register).value;

        let arg = params[params.length - 1].substr(
          0,
          params[params.length - 1].length - 1
        );
        if (!isNaN(parseInt(arg))) toMove = array[parseInt(arg)];
        else {
          console.log(arg);

          let arrayIdx = findAndGet(programState.registers, arg.toUpperCase())
            .value;
          toMove = array[parseInt(arrayIdx)];
        }
      } else if (params.includes("LENGTHOF") || params.includes("lengthof")) {
        toMove = getLengthOf(programState.registers, params, false);
      } else {
        toMove = findAndGet(programState.registers, params[1].toUpperCase());
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
      let second;
      if (params[0].includes("lengthof") || params[0].includes("LENGTHOF")) {
        first = getLengthOf(programState.registers, params, false);
      } else {
        first = findAndGet(
          programState.registers,
          params[0].substr(0, params[0].length - 1).toUpperCase()
        ).value;
      }
      // Find the index of the second parameter
      let secondIdx = 0;
      params.forEach((param: any, index: any) => {
        if (param.endsWith(",")) {
          secondIdx = index + 1;
        }
      });
      if (
        params[secondIdx].includes("lengthof") ||
        params[secondIdx].includes("LENGTHOF")
      ) {
        second = getLengthOf(programState.registers, params, false);
      } else {
        second = findAndGet(
          programState.registers,
          params[secondIdx].toUpperCase()
        ).value;
      }
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
    case "lea":
      stateCopy.registers = findAndSet(
        stateCopy.registers,
        params[0].substr(0, params[0].length - 1).toUpperCase(),
        null,
        "lea",
        params[1]
      );
      console.log(stateCopy);
      goToNextLine();
      break;
    case "mul":
      let mulOne = findAndGet(stateCopy.registers, params[0].toUpperCase());
      let mulTwo = findAndGet(stateCopy.registers, "EAX");

      stateCopy.registers = findAndSet(
        stateCopy.registers,
        "EAX",
        StringMath(`${mulOne.value} * ${mulTwo.value}`),
        null
      );
      goToNextLine();
      break;
    case "div":
      let divOne = findAndGet(stateCopy.registers, params[0].toUpperCase());
      let divTwo = findAndGet(stateCopy.registers, "EAX");

      stateCopy.registers = findAndSet(
        stateCopy.registers,
        "EAX",
        StringMath(`${divOne.value} / ${divTwo.value}`),
        null
      );
      goToNextLine();
      break;
    case "add":
      let addOne = findAndGet(
        stateCopy.registers,
        params[0].toUpperCase().substr(0, params[0].length - 1)
      );
      let addTwo = findAndGet(stateCopy.registers, params[1].toUpperCase());

      stateCopy.registers = findAndSet(
        stateCopy.registers,
        params[0].toUpperCase().substr(0, params[0].length - 1),
        StringMath(`${addOne.value} + ${addTwo.value}`),
        null
      );
      goToNextLine();
      break;
    case "sub":
      let subOne = findAndGet(
        stateCopy.registers,
        params[0].toUpperCase().substr(0, params[0].length - 1)
      );
      let subTwo = findAndGet(stateCopy.registers, params[1].toUpperCase());

      stateCopy.registers = findAndSet(
        stateCopy.registers,
        params[0].toUpperCase().substr(0, params[0].length - 1),
        StringMath(`${subOne.value} - ${subTwo.value}`),
        null
      );
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
        params[0].toUpperCase(),
        null,
        "inc"
      );
      goToNextLine();
      break;
    case "dec":
      stateCopy.registers = findAndSet(
        programState.registers,
        params[0].toUpperCase(),
        null,
        "dec"
      );
      goToNextLine();
      break;
    case "ret":
      // End the program
      end();
      break;
    case "main":
      end();
      break;
    default:
      setProgramState({ ...programState, error: true });
  }
};

const findAndSet = (
  registers: Array<IRegister>,
  toFind: string,
  val: any | null,
  operation: string | null,
  pointTo?: string
) => {
  // Find and set the value
  return registers.map((reg) => {
    if (reg.name === toFind) {
      if (reg.pointingTo) reg.pointingTo = undefined;
      if (operation === "inc")
        return { ...reg, value: parseInt(reg.value) + 1 };
      else if (operation === "dec")
        return { ...reg, value: parseInt(reg.value) - 1 };
      else if (operation === "lea") {
        let pointer = findAndGet(registers, pointTo);
        return {
          ...reg,
          value: "Register: " + pointTo,
          pointingTo: pointer,
        };
      }
      return { ...reg, value: val };
    }
    return reg;
  });
};

const findAndSetAtIndex = (
  registers: Array<IRegister>,
  toFind: string,
  val: any | null,
  index: number
) => {
  let result = [] as IRegister[];
  for (let i = 0; i < registers.length; i++) {
    if (registers[i].name === toFind.toUpperCase()) {
      console.log("here");

      if (registers[i].pointingTo) {
        result = [] as IRegister[];
        console.log(registers[i].pointingTo);

        for (let j = 0; j < registers.length; j++) {
          if (registers[j].name === registers[i].pointingTo!.name) {
            let vals = [...registers[j].value];
            vals[index] = val;
            result.push({ ...registers[j], value: vals });
          }
        }
        return result;
      }
      let vals = [...registers[i].value];
      vals[index] = val;
      result.push({ ...registers[i], value: val });
    }
  }
};

const findAndGet = (
  registers: Array<IRegister>,
  toFind: string | undefined
) => {
  console.log(toFind);

  let reg = registers.filter(
    (reg) => reg.name.toUpperCase() === toFind?.toUpperCase()
  )[0];
  console.log(reg);

  if (reg.pointingTo) return reg.pointingTo;
  return reg;
};

const findNextCode = (
  code: Array<ICommand>,
  blockKey: string,
  currentLine: any,
  end: () => void
) => {
  let next = code
    .filter((x: ICommand) => x.key === blockKey)[0]
    .cmds.filter((x: ICmd) => x?.lineNo === currentLine + 1)[0];
  if (next) return next;
  else end();
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
  params: Array<any>,
  isFirstArg: boolean
): number | undefined => {
  for (let i = 0; i < params.length; i++) {
    if (params[i].toUpperCase().startsWith("LENGTHOF")) {
      let register = findAndGet(registers, params[i + 1]);
      if (!isFirstArg) {
        return StringMath(
          register.value.length.toString() + params.slice(i + 2).join("")
        );
      }
    }
  }
  return undefined;
};

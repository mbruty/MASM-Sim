import { ICmd, ICommand } from "./ICommand";
import IRegister from "./IRegister";
const StringMath = require("string-math");

export default (programState: any, setProgramState: (state: any) => void) => {
  const [instruction, ...params] = programState.nextCmd.cmd.split(" ");

  // Remove the trailing ,
  params[0] = params[0].substr(0, params[0].length - 1);

  switch (instruction) {
    case "mov":
      // Get the second variable to move in to the first variable
      let toMove = programState.registers.filter(
        (x: IRegister) => x.name === params[1]
      );
      if (toMove.length === 0) {
        // Array access - not finished
        if (params[1].charAt(0) === "[") {
          toMove = programState.registers.filter(
            (x: IRegister) => x.name === params[2]
          )[0][parseInt(params[3])];
        } else if (params[1].toUpperCase() === "LENGTHOF") {
          let value = programState.registers.filter(
            (x: IRegister) => x.name === params[2]
          )[0];
          let equation: string = value.value.length + " " + params.slice(3, params.length).join(' ');
          toMove = StringMath(equation);
        } else {
          toMove = params[1];
        }
      }
      let stateCopy = { ...programState };
      stateCopy.registers.forEach((register: IRegister) => {
        if (register.name === params[0].toUpperCase()) {
          register.value = toMove;
        }
      });
      stateCopy.nextCmd = stateCopy.codes
        .filter((x: ICommand) => x.key === stateCopy.blockKey)[0]
        .cmds.filter((x: ICmd) => x.lineNo === stateCopy.currentLine + 1)[0];
      stateCopy.currentLine = stateCopy.currentLine + 1;
      setProgramState(stateCopy);
      break;
    default:
      setProgramState({ ...programState, error: true });
  }
};

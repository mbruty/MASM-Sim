import { ICmd, ICommand } from "./ICommand";
import IRegister from "./IRegister";

export default (programState: any, setProgramState: (state: any) => void) => {
  const [instruction, ...params] = programState.nextCmd.cmd.split(" ");

  // Remove the trailing ,
  params[0] = params[0].substr(0, params[0].length - 1);

  switch (instruction) {
    case "mov":
      // Get the second variable to move in to the first variable
      let toMove =
        typeof params[1] === "string"
          ? params[1]
          : programState.registers.filter(
              (x: IRegister) => x.name === params[1]
            );
      let stateCopy = { ...programState };
      stateCopy.registers.forEach((register: IRegister) => {
        if (register.name === params[0].toUpperCase()) {
          register.value = toMove;
          console.log("Yes");
        }
      });
      stateCopy.nextCmd = stateCopy.codes.filter(
        (x: ICommand) => x.key === stateCopy.blockKey
      )[0].cmds.filter((x: ICmd) => x.lineNo === stateCopy.currentLine + 1);
      console.log(stateCopy.nextCmd);
      stateCopy.currentLine = stateCopy.currentLine + 1;
      setProgramState(stateCopy);
      break;
    default:
      setProgramState({ ...programState, error: true });
  }
};

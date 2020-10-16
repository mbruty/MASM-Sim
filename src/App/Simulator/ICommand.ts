export interface ICommand {
  key: string;
  cmds: Array<ICmd>;
}

export interface ICmd{
  cmd: string;
  lineNo: number;
}
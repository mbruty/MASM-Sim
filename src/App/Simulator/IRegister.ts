export default interface IRegister {
  name: string;
  value: any;
  register: boolean;
  pointingTo: IRegister | undefined;
}
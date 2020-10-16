import {
  Grid,
  makeStyles,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core";
import IRegister from "./Simulator/IRegister";
import React, { useMemo, useState } from "react";
import Buttons from "./Simulator/Buttons";
import ParseAsm from "./Simulator/ParseAsm";
import Sim from "./Simulator/Sim";
import Alert from "@material-ui/lab/Alert";
import { ICmd } from "./Simulator/ICommand";
interface SimulatorProps {
  code: string;
  setLocked: (newState: any) => void;
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "column",
    alignItems: "center",

    "& > *": {
      marginBottom: "25px",
    },
  },
}));

export default (props: SimulatorProps) => {
  const [started, setStarted] = useState(false);
  const [useHex, setUseHex] = useState(false);
  const [programState, setProgramState] = useState({
    registers: [] as Array<IRegister>,
    currentLine: 0,
    nextCmd: { cmd: "", lineNo: 0 } as ICmd,
    blockKey: 'main',
    codes: {},
    error: false,
  });
  console.log(programState)
  useMemo(() => {
    const { registers, codes } = ParseAsm(props.code);
    setProgramState({
      registers,
      currentLine: codes[0].cmds[0].lineNo,
      nextCmd: codes[0].cmds[0],
      codes,
      blockKey: 'main',
      error: false,
    });
  }, [props.code]);

  const classes = useStyles();

  const nextClick = (e: any) => {
    Sim(programState, setProgramState);
  };

  if (started) {
    return (
      <div className={classes.root}>
        {programState.error ? (
          <Alert severity="error">I fucked up</Alert>
        ) : null}
        <Buttons
          setLocked={props.setLocked}
          nextClick={nextClick}
          setStarted={setStarted}
          started={started}
        />
        <p>Show numbers in hex?</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Grid component="label" container alignItems="center" spacing={1}>
            <Grid item>No</Grid>
            <Grid item>
              <Switch
                checked={useHex}
                onChange={(e) => setUseHex(!useHex)}
                name="checkedC"
              />
            </Grid>
            <Grid item>Yes</Grid>
          </Grid>
        </div>
        <Paper
          style={{ padding: "5px", paddingLeft: "15px", paddingRight: "15px" }}
        >
          <p>EIP pointing to line: {programState.currentLine}</p>
        </Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Variable Name</TableCell>
                <TableCell>Value(s)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programState.registers.filter(x => !x.register).map((v) => (
                <TableRow>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>
                    {v.value.toString().includes(",")
                      ? "[ " + v.value + " ]"
                      : v.value}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Register Name</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {programState.registers.filter(x => x.register).map((register: IRegister) => (
                <TableRow>
                  <TableCell>{register.name}</TableCell>
                  <TableCell>{register.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <pre style={{ overflowY: "scroll" }}>
          {JSON.stringify(programState.codes, null, 4)}
        </pre>
      </div>
    );
  }

  return (
    <Buttons
      setLocked={props.setLocked}
      nextClick={nextClick}
      started={started}
      setStarted={setStarted}
    />
  );
};

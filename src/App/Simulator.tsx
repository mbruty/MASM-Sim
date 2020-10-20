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
  locked: boolean;
}
const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "column",
    alignItems: "center",
    overflow: "auto",
    width: "40%",

    "& > *": {
      marginBottom: "25px",
    },
  },
}));

const toHex = (val: string | number): string => {
  if (typeof val === "number" || !isNaN(parseInt(val))) {
    return Number(val).toString(16);
  } else {
    if (val.toString().length === 3) {
      return Number(val.toString().charCodeAt(0)).toString(16);
    }
    let chars = [];
    for (let i = 0; i < val.length; i++) {
      chars.push(Number(val[i].toString().charCodeAt(1)).toString(16));
    }
    return "[ " + chars.join(", ") + " ]";
  }
};
export default (props: SimulatorProps) => {
  const [started, setStarted] = useState(false);
  const [useHex, setUseHex] = useState(false);
  console.log(useHex);

  const [programState, setProgramState] = useState({
    registers: [] as Array<IRegister>,
    currentLine: 0,
    nextCmd: { cmd: "", lineNo: 0 } as ICmd,
    blockKey: "main",
    codes: {},
    error: false,
    reset: false,
    comparrison: {
      valOne: "",
      valTwo: "",
      result: "",
    },
  });
  useMemo(() => {
    const { registers, codes } = ParseAsm(props.code);
    try {
      setProgramState({
        registers,
        currentLine: codes[0].cmds[0].lineNo,
        nextCmd: codes[0].cmds[0],
        codes,
        blockKey: "main",
        error: false,
        reset: false,
        comparrison: {
          valOne: "null",
          valTwo: "null",
          result: "null",
        },
      });
    } catch (e) {
      setProgramState({ ...programState, error: true });
    }
  }, [props.code, programState.reset]); // eslint-disable-line react-hooks/exhaustive-deps

  useMemo(() => {
    const element = document.querySelector<HTMLElement>(`.tln-wrapper`)!;
    if (element) {
      Array.from(element.children as HTMLCollectionOf<HTMLElement>).forEach(
        (node, idx) => {
          if (idx + 1 === programState.currentLine) {
            node.style.backgroundColor = "#74f24b";
            node.style.color = "black";
          } else {
            node.style.backgroundColor = "#1c1c1c";
            node.style.color = "#eeeeee";
          }
        }
      );
    }
  }, [programState.currentLine]);

  const classes = useStyles();

  const nextClick = (e: any) => {
    Sim(programState, setProgramState, props.setLocked, setStarted);
  };

  if (started) {
    return (
      <div className={classes.root}>
        {programState.error ? (
          <Alert severity="error">
            UhOh! Either your code isn't working or the current operation has
            not been implemented yet. Please raise an issue on GitHub or email
            me at mike@bruty.net and I'll get on it asap
          </Alert>
        ) : null}
        <img
          src="https://img.icons8.com/fluent/48/000000/github.png"
          style={{
            position: "absolute",
            top: "100px",
            right: "25px",
            cursor: "pointer",
          }}
          onClick={(e) =>
            window.open("https://github.com/mbruty/MASM-Sim", "_blank")
          }
        />
        <Buttons
          setProgramState={setProgramState}
          programState={programState}
          setLocked={props.setLocked}
          nextClick={nextClick}
          setStarted={setStarted}
          started={started}
        />
        <Paper
          style={{
            padding: "5px",
            paddingLeft: "15px",
            paddingRight: "15px",
          }}
        >
          <p>EIP pointing to line: {programState.currentLine}</p>
        </Paper>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variable Name</TableCell>
                  <TableCell>Value(s)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programState.registers
                  .filter((x) => !x.register)
                  .map((v) => (
                    <TableRow>
                      <TableCell>{v.name}</TableCell>
                      <TableCell>
                        {v.value.toString().includes(",")
                          ? useHex
                            ? toHex(v.value)
                            : "[ " + v.value.join(", ") + " ]"
                          : useHex
                          ? toHex(v.value)
                          : v.value}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Register Name</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programState.registers
                  .filter((x) => x.register)
                  .map((register: IRegister) => (
                    <TableRow>
                      <TableCell>{register.name}</TableCell>
                      <TableCell>{register.value}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <Paper
          style={{
            padding: "5px",
            paddingLeft: "15px",
            paddingRight: "15px",
          }}
        >
          <h4>Comparison:</h4>
          <p>
            {programState.comparrison.valOne}, {programState.comparrison.valTwo}
          </p>
          <p>Result: {programState.comparrison.result}</p>
        </Paper>
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
        <p style={{ width: "50ch" }}>
          Note: This doesn't have any error checking built in, so please run it
          through an actual compiler and make sure it runs to the end before
          using this app or else it might break if you code doesn't work
          properly
        </p>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <img
        src="https://img.icons8.com/fluent/48/000000/github.png"
        style={{
          position: "absolute",
          top: "100px",
          right: "25px",
          cursor: "pointer",
        }}
        onClick={(e) =>
          window.open("https://github.com/mbruty/MASM-Sim", "_blank")
        }
      />
      <Buttons
        setProgramState={setProgramState}
        programState={programState}
        setLocked={props.setLocked}
        nextClick={nextClick}
        started={started}
        setStarted={setStarted}
      />
      <p style={{ width: "50ch" }}>
        Note: This doesn't have any error checking built in, so please run it
        through an actual compiler and make sure it runs to the end before using
        this app or else it might break if you code doesn't work properly
      </p>
    </div>
  );
};

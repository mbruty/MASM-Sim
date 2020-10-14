import {
  makeStyles,
  Paper,
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

interface SimulatorProps {
  code: string;
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
  const { vars, registers } = useMemo(() => ParseAsm(props.code), [props.code]);

  const classes = useStyles();

  if (started) {
    return (
      <div className={classes.root}>
        <Buttons setStarted={setStarted} />
        <Paper
          style={{ padding: "5px", paddingLeft: "15px", paddingRight: "15px" }}
        >
          <p>EIP pointing to line: 6</p>
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
              {vars.map((v) => (
                <TableRow>
                  <TableCell>{v.name}</TableCell>
                  <TableCell>
                    {v.value.toString().includes(",") ? "[ " + v.value + " ]" : v.value}
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
              {registers.map((register: IRegister) => (
                <TableRow>
                  <TableCell>{register.name}</TableCell>
                  <TableCell>{register.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }

  return <Buttons setStarted={setStarted} />;
};

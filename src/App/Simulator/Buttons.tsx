import {
  Button,
  ButtonGroup,
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core";
import { ArrowRightAlt, PlayArrow, Stop } from "@material-ui/icons";
import React from "react";

interface ButtonsProps {
  setStarted: (started: boolean) => void;
  started: boolean;
  nextClick: (e: any) => void;
  setLocked: (locked: boolean) => void;
  programState: any;
  setProgramState: (state: any) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    marginLeft: "auto",
    marginRight: "auto",
    flexDirection: "column",
    alignItems: "center",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
}));

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#cc2833",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      light: "#0066ff",
      main: "#50ff00",
      // dark: will be calculated from palette.secondary.main,
      contrastText: "#ffcc00",
    },
    // Used by `getContrastText()` to maximize the contrast between
    // the background and the text.
    contrastThreshold: 3,
    // Used by the functions below to shift a color's luminance by approximately
    // two indexes within its tonal palette.
    // E.g., shift from Red 500 to Red 300 or Red 700.
    tonalOffset: 0.2,
  },
});

export default (props: ButtonsProps) => {
  const onClick = (e: any) => props.setStarted(!props.started);
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <ButtonGroup
        variant="text"
        color="primary"
        aria-label="text primary button group"
      >
        <Button color="secondary" disabled={props.started} onClick={onClick}>
          <PlayArrow />
          Run
        </Button>
        <Button onClick={props.nextClick}>
          <ArrowRightAlt />
          Next
        </Button>
        <ThemeProvider theme={theme}>
          <Button
            color="primary"
            onClick={(e: any) => {
              onClick(e);
              // Setting this to trigger the memoised state in Simulator
              props.setProgramState({ ...props.programState,  reset: true});
            }}
            disabled={!props.started}
          >
            <Stop />
            Stop
          </Button>
        </ThemeProvider>
      </ButtonGroup>
    </div>
  );
};

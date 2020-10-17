import React, { useState } from "react";
import "./App.css";
import Simulator from "./App/Simulator";
import TextEditor from "./App/TextEditor";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { dark } from "@material-ui/core/styles/createPalette";

const theme = createMuiTheme({
  palette: {
    type: "dark",
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#0094ff",
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

function App() {
  const [locked, setLocked] = useState(false);
  let [text, setText] = useState(`.MODEL FLAT, stdcall
.STACK 4096
.data
	message DWORD "r", "a", "c", "e", "c", "a", "r"
	answer DWORD 0
.code
main PROC
	mov ebx, 0
	mov ecx, LENGTHOF message - 1
	JMP L1

L1:
	; get the value at the left and right pointer
	mov eax, [message + ebx * 4] ; get the value at the left pointer
	mov edx, [message + ecx * 4] ; get the value at the right pointer
	cmp eax, edx ; if value at the left pointer and the right pointer are the same
	jne False ; if they aren't equal go to false
	inc ebx ; left ptr ++
	dec ecx; right pointer --
	cmp ebx, LENGTHOF message; if we're at the end of the array it's a palindrome!
	je True
	jmp L1


True:
	ret 1

False:
	ret 0

main endp
end main`);
  if (locked) {
    setText = () => null;
  }
  return (
    <ThemeProvider theme={theme}>
      <div className="App">
        <TextEditor text={text} setText={setText} />
        <Simulator locked={locked} setLocked={setLocked} code={text} />
      </div>
    </ThemeProvider>
  );
}

export default App;

import React from "react";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";

function DatePicker(props) {
  const [mode, setMode] = React.useState("light"); // Default to light mode

  // Use effect to detect the user's system preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    if (mediaQuery.matches) {
      setMode("dark");
    }
    // Add an event listener to detect changes in system theme preference
    const handleChange = (event) => {
      setMode(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);

    // Clean up event listener on unmount
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);
  return (
    <>
      <div className="mt-2"></div>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DemoContainer
          sx={{ cursor: "pointer" }}
          components={["DateTimePicker"]}
        >
          <DateTimePicker
            sx={{
              // width: "300px", // Customize the width
              backgroundColor: "#", // Background color
              borderRadius: "8px",
              borderColor: mode === "dark" ? "#888" : "#555",
              cursor: "pointer",

              // Rounded corners
              ".MuiInputBase-input": {
                color: mode === "dark" ? "white" : "black", // Input text color
                borderColor: "#888",
              },
              ".MuiFormLabel-root": {
                color: mode === "dark" ? "white" : "black", // Label color
              },
              ".MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#888", // Default border color
                  borderWidth: "1px", // Default border width
                },
              },
            }}
            minDate={props?.minDate?.add(1, "day") || dayjs()}
            disabled={props.disabled}
            value={props.value}
            onChange={props.changeValue}
            label={props.label}
          />
        </DemoContainer>
      </LocalizationProvider>
    </>
  );
}

export default DatePicker;

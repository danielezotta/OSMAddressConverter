
import React from "react";
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import { AppContext } from './AppContext';

class ComparisonForm extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      sourceAttr: null,
      destAttr: null,
      compOperation: null,
    }
  }

  handleSubmit(event, context) {
    if (this.state.sourceAttr != null && this.state.destAttr != null && this.state.compOperation != null) {
      context.setCompareParametersDialogParams({
        sourceAttribute: this.state.sourceAttr, 
        destinationAttribute: this.state.destAttr,
        compareOperation: this.state.compOperation,
      });

      this.setState({ sourceAttr: null });
      this.setState({ destAttr: null });
      this.setState({ compOperation: null });
    }
  }

  render() {
    return (
      <AppContext.Consumer> 
        { context => (
          <Box>
            <Stack 
              justifyContent="space-evenly"
              alignItems="center"
              direction="row">

              <FormControl sx={{ m: 1, minWidth: 180 }}>
                <InputLabel id="source-option">First marker</InputLabel>
                <Select
                  labelId="source-option"
                  id="source-option-select"
                  label="Municipality"
                  autoWidth
                  defaultValue=""
                  onChange={ (event) => { this.setState({ sourceAttr: event.target.value }) } }
                >
                  { context.compareMarkers.length > 1 && Object.keys(context.compareMarkers[0].properties).map((key) =>
                    <MenuItem key={key} value={key}>{key}</MenuItem>  
                  )}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 1, minWidth: 180 }}>
                <InputLabel id="dest-option">Second marker</InputLabel>
                <Select
                  labelId="dest-option"
                  id="dest-option-select"
                  label="OSM"
                  autoWidth
                  defaultValue=""
                  onChange={ (event) => { this.setState({ destAttr: event.target.value }) } }
                >
                  { context.compareMarkers.length > 1 && Object.keys(context.compareMarkers[1].properties).map((key) =>
                    <MenuItem key={key} value={key}>{key}</MenuItem>
                  )}
                </Select>
              </FormControl>

              <FormControl sx={{ m: 1, minWidth: 180 }}>
                <InputLabel id="operation-option">Operation</InputLabel>
                <Select
                  labelId="operation-option"
                  id="operation-option-select"
                  label="Operation"
                  autoWidth
                  defaultValue=""
                  onChange={ (event) => { this.setState({ compOperation: event.target.value }) } }
                >
                  <MenuItem value="equals">equals</MenuItem>
                  <MenuItem value="similarity">similarity</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Button 
              color="primary" 
              aria-label="Add parameters" 
              component="label"
              type="submit"
              startIcon={ <AddIcon/> }
              onClick={ (e) => { this.handleSubmit(e, context) } } >
            </Button>
          </Box>
        )}
      </AppContext.Consumer>
    );
  }

}

export default ComparisonForm;
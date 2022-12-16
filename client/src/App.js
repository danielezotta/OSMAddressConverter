import React from "react";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Unstable_Grid2';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SideMenu from './SideMenu.js';
import { AppContext } from "./AppContext.js";
import ComparisonForm from "./ComparisonForm.js";
import LeafletMap from "./Map.js";

import './App.css';


function ManualDeleteListItem({ marker }) {
  // const map = useMap();

  return (
    <Typography key={`marker-delete-${marker.id}`} variant="p" component="div">
      - {marker.properties.street}, {marker.properties.number}
      {/* <IconButton onClick={(e) => {
          // map.setView(marker.geometry.coordinates, 18);
        }}>
        <RoomIcon/>
      </IconButton> */}
      <IconButton onClick={(e) => {
          this.setState({ manualDelete: this.state.manualDelete.filter((x) => marker.id == x.id) });
        }}>
        <DeleteOutlineIcon/>
      </IconButton>
    </Typography>
  );
}


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      markersBase: [],
      markersOSM: [],
      markersPreview: [],
      selectedBaseFile: "No file selected",
      selectedOSMFile: "No file selected",
      layerBaseEnabled: true,
      layerOSMEnabled: true,
      layerPreviewEnabled: true,
      loading: false,
      comparing: false,
      compareMarkers: [],
      compareDialog: { open: false, result: [] },
      compareParametersDialog: { open: false, params: [] },
      manualDelete: [],
      responseSnackbar: { open: false, message: "" },
      refinementParameters: {},
      markersBaseKeys: [],
      markersOSMKeys: [],
      // Setters
      setLoading: (x) => { this.setState({ loading: x }) },
      setMarkersBase: (markers) => { this.setState({ markersBase : markers }) },
      setMarkersOSM: (markers) => { this.setState({ markersOSM : markers }) },
      setMarkersPreview: (markers) => { this.setState({ markersPreview : markers }) },
      setSelectedBaseFile: (x) => { this.setState({ selectedBaseFile: x }) },
      setSelectedOSMFile: (x) => { this.setState({ selectedOSMFile: x }) },
      setManualDelete: (x) => { this.setState({ manualDelete: x }) },
      setCompareMarkers: (x) => { this.setState({ compareMarkers: x }) },
      addCompareMarker: (x) => { this.setState({ compareMarkers: [...this.state.compareMarkers, x] }) },
      setRefinementParameters: (x) => { this.setState({ refinementParameters: x }) },
      toggleLayerBase: () => { this.setState({ layerBaseEnabled: !this.state.layerBaseEnabled }) },
      toggleLayerOSM: () => { this.setState({ layerOSMEnabled: !this.state.layerOSMEnabled }) },
      toggleLayerPreview: () => { this.setState({ layerPreviewEnabled: !this.state.layerPreviewEnabled }) },
      setSnackbar: (x) => { this.setState({ responseSnackbar: x}) },
      setCompareParametersDialogParams: (x) => { this.setState({ compareParametersDialog: { ...this.state.compareParametersDialog, params: this.state.compareParametersDialog.params.concat(x) } }) },
      setCompareParametersDialogOpen: (x) => { this.setState({ compareParametersDialog: { ...this.state.compareParametersDialog, open: x } }) },
      setMarkersBaseKeys: (x) => { this.setState({ markersBaseKeys: x }) },
      setMarkersOSMKeys: (x) => { this.setState({ markersOSMKeys: x }) },
    };
  }

  compareMarkers() {

    this.setState({ compareParametersDialog: { ...this.state.compareParametersDialog, open: false }});
    this.setState({ loading: true });
                            
    var data = {};
    data['markers'] = this.state.compareMarkers;
    data['compareParameters'] = this.state.compareParametersDialog.params;

    fetch("/api/housenumbers/compare", { method: "POST", body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, })
      .then((response) => response.json())
      .then((response) => {

        console.log(response);
        this.setState({ loading: false });
        this.setState({ compareDialog : { ...this.state.compareDialog, open: true, result: response }});

      });

    const {compareMarkers} = this.state;
    compareMarkers.length = 0;
    this.setState({ compareMarkers });

  }

  render() {  

    return (
      <AppContext.Provider value={this.state}>
        <Box>

          { this.state.loading && 
          <Box display="flex" 
            alignItems="center"
            zIndex="2000"
            justifyContent="center" sx={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, bgcolor: 'text.secondary' }}>

            <Stack display="flex" alignItems="center" justifycontent="center" sx={{ bgcolor: '#eeeeee', p:2 }}>
              <CircularProgress justifycontent="center"/>
              <br/>
              <Typography variant="h6" component="div" align="center">
                Loading and elaborating...
              </Typography>
            </Stack>

          </Box>
          }

          <Dialog 
            open={this.state.compareParametersDialog.open}
            maxWidth="md"
            fullWidth={true}
          >
            <DialogTitle>Set comparison parameters</DialogTitle>
            <DialogContent>
              <Stack sx={{ mx:3, mb:3 }}>
                { this.state.compareParametersDialog["params"].map((x) => 
                  <Typography 
                    key={ x.sourceAttribute + x.destinationAttribute + x.compareOperation }
                    variant="p"
                    component="div"
                    sx={{ my: 1 }}>
                    - Compare <i>{x.sourceAttribute}</i> with <i>{x.destinationAttribute}</i> using <i>{x.compareOperation}</i>
                  </Typography>
                )}
                <ComparisonForm />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button 
                autoFocus 
                variant="contained" 
                onClick={(e) => { this.compareMarkers(); }}>
                Compare
              </Button>
            </DialogActions>
          </Dialog>

          <Grid container spacing={0}>
            <Grid xs={3} sx={{ p:3 }}>
              <SideMenu />
            </Grid>
            <Grid xs={(this.state.manualDelete.length > 0)? 6 : 9}>

              <LeafletMap/>

            </Grid>
              {this.state.manualDelete.length > 0 &&
                <Grid xs={3} sx={{ p:2 }}>

                  <Typography variant="h6" component="div">Manual delete</Typography>

                  <Stack>
                    { this.state.manualDelete.map((marker) =>
                      <ManualDeleteListItem marker={ marker }/>
                    )}
                  </Stack>

                  <Button sx={{ m:1 }} variant="contained" component="span" onClick={(e) => {
                  
                    this.setState({ loading: true });

                    fetch("/api/housenumbers/base", { method: "DELETE", body: JSON.stringify({ "addresses": this.state.manualDelete }), headers: { 'Content-Type': 'application/json' }, })
                      .then((response) => response.json())
                      .then((response) => {
                        this.setMarkersBase(response);
                        this.setState({ manualDelete: [] });
                        this.setState({ loading: false });
                      });

                  }}> Delete all in list </Button>
                
                </Grid>
              }
          </Grid>
        </Box>
      </AppContext.Provider>
      
      
    );
  }
  
}

export default App;

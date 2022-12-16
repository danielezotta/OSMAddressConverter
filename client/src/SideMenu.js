
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import PreviewIcon from '@mui/icons-material/Preview';
import WrongLocationIcon from '@mui/icons-material/WrongLocation';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
import SideMenuSlider from './SideMenuSlider';
import { AppContext } from './AppContext';

class SideMenu extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      markersBasePropertiesDialog: { open: false },
      markersOSMPropertiesDialog: { open: false },
      markersBaseAttrs: {},
      markersOSMAttrs: {},
      toggleMarkersBaseAttr: (x) => { this.state.markersBaseAttrs[x] = !this.state.markersBaseAttrs[x]; this.setState({ markersBaseAttrs: this.state.markersBaseAttrs }); },
      toggleMarkersOSMAttr: (x) => { this.state.markersOSMAttrs[x] = !this.state.markersOSMAttrs[x]; this.setState({ markersOSMAttrs: this.state.markersOSMAttrs }); },
    };
  }

  uploadGPKGFile(context, event) {

    context.setLoading(true);
    context.setSelectedOSMFile(event.target.files[0].name);

    var formData = new FormData();
    formData.append("gpkg", event.target.files[0]);

    fetch("/api/files/gpkg", { method: "POST", body: formData, })
    .then((response) => response.json())
    .then((response) => {

      context.setMarkersOSM(response);
      context.setLoading(false);

      var obj = {};

      response.map((e) => 
        Object.keys(e.properties).map((e) => 
          obj[e] = false
        )
      );

      this.setState({ markersOSMAttrs: obj });

    }, (e) => {
      alert("Error submitting form!");
      context.setLoading(false);
    });

  }

  uploadKMLFile(context, event) {

    context.setLoading(true);
    context.setSelectedBaseFile(event.target.files[0].name);

    var formData = new FormData();
    formData.append("kml", event.target.files[0]);

    fetch("/api/files/kml", { method: "POST", body: formData, })
      .then((response) => response.json())
      .then((response) => {

        context.setMarkersBase(response);
        context.setLoading(false);
        
        var obj = {};
        Object.keys(response[0].properties).map((e) => 
          obj[e] = false
        );
        this.setState({ markersBaseAttrs: obj });


      }, function(e) {
        alert("Error submitting form!");
        context.setLoading(false);
      });

  }

  removeFromMunicipality(context, event) {

    context.setLoading(true);

    var data = {};
    data['distance'] = (context.refinementParameters.distance / 1000);
    data['streetSimilarity'] = (context.refinementParameters.streetSimilarity / 100);

    fetch("/api/housenumbers", { method: "POST", body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, })
      .then((response) => response.json())
      .then((response) => {
        var removedAddressesNumber = context.markersBase.length - response.length;
        context.setMarkersBase(response);
        context.setLoading(false);
        context.setSnackbar({ 
            ...context.responseSnackbar,
            message: `Removed ${removedAddressesNumber} addresses`,
            open: true,
          });
      });

  }


  getSimilarPreview(context, event) {

    context.setLoading(true);

    var data = {};

    fetch("/api/housenumbers/similar", { method: "POST", body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' }, })
      .then((response) => response.json())
      .then((response) => {
        // var removedAddressesNumber = this.state.markersBase.length - response.length;
        context.setMarkersPreview(response);
        context.setLoading(false);
      });

  }

  getOSMFile(context, event) {

    context.setLoading(true);

    fetch("/api/housenumbers/osm", { method: "GET", headers: { 'Content-Type': 'application/json' }, })
      .then((response) => response.json())
      .then((response) => {
        console.log(response);
        context.setLoading(false);
      });

  }

  render() {

    return (
      <AppContext.Consumer> 
        {context => (
          <Box>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              OSM Address Converter
            </Typography>

            <br/>

            <input
              accept=".kml"
              className={ this.props.input }
              style={{ display: 'none' }}
              id="kml-button-file"
              multiple
              type="file"
              onChange={ (event) => this.uploadKMLFile(context, event) }
            />
            <label htmlFor="kml-button-file">
              <Button sx={{ m: 1 }} variant="contained" component="span" startIcon={ <FileUploadIcon/> }> 
                Upload municipality .kml
              </Button>
            </label>
            
            <Typography variant="p" component="div" sx={{ flexGrow: 1, m: 1 }}>
              {`${context.selectedBaseFile} [${context.markersBase.length} addresses]`}
            </Typography>
            
            <br/>

            <input
              accept=".gpkg"
              className={ this.props.input }
              style={{ display: 'none' }}
              id="gpkg-button-file"
              multiple
              type="file"
              onChange={ (event) => this.uploadGPKGFile(context, event) }
            />
            <label htmlFor="gpkg-button-file">
              <Button sx={{ m:1 }} variant="contained" component="span" startIcon={ <FileUploadIcon/> }>
                Upload .gpkg extraction
              </Button>
            </label>

            <Typography variant="p" component="div" sx={{ flexGrow: 1, m: 1 }}>
              {`${context.selectedOSMFile} [${context.markersOSM.length} addresses]`}
            </Typography>
            
            <br/>

            <FormControlLabel
              control={<Checkbox disabled={context.markersBase.length < 1} checked={context.layerBaseEnabled} onChange={(e) => {context.toggleLayerBase();}}/>}
              label="Show municipality markers"
            />
            
            <br/>

            <FormControlLabel
              control={<Checkbox disabled={context.markersOSM.length < 1} checked={context.layerOSMEnabled} onChange={(e) => {context.toggleLayerOSM();}}/>}
              label="Show OSM export markers"
            />

            <br/>

            <FormControlLabel
              control={<Checkbox disabled={context.markersPreview.length < 1} checked={context.layerPreviewEnabled} onChange={(e) => {context.toggleLayerPreview();}}/>}
              label="Show preview markers"
            />

            <br/>

            { context.markersBase.length > 0 &&
              <Button
                sx={{ my:2 }}
                component="span" 
                onClick={ (e) => { this.setState({ markersBasePropertiesDialog: { ...this.state.markersBasePropertiesDialog, open: true } }) } }>
                Choose municipality attributes
              </Button>
            }

            { context.markersOSM.length > 0 &&
              <Button
                sx={{ my:2 }}
                component="span" 
                onClick={ (e) => { this.setState({ markersOSMPropertiesDialog: { ...this.state.markersOSMPropertiesDialog, open: true } }) } }>
                Choose OSM attributes
              </Button>
            }

            <br/>

            <Typography variant="h6" component="div" sx={{ flexGrow: 1, mt: 3 }}>Refinement</Typography>
            
            <br/>

            <Box sx={{ mx:2 }}>

              <SideMenuSlider 
                title="Distance"
                tooltipText="The distance between the OSM point and the municipality one. If below or equal will be removed."
                sliderMin={2.5}
                sliderMax={75}
                sliderStep={2.5}
                sliderDefaultValue={10}
                sliderMarks={ [
                  { value: 2.5, label: '2.5 m', }, 
                  { value: 10, label: '10 m', },
                  { value: 20, label: '20 m', },
                  { value: 35, label: '35 m', },
                  { value: 50, label: '50 m', },
                  { value: 75, label: '75 m', },
                ] }
                onChangeCommitted={(e, v) => { context.setRefinementParameters({ ...context.refinementParameters, distance: v }) }} />

              <SideMenuSlider 
                sx={{ mt:3 }}
                title="Street similarity (%)"
                tooltipText="The percentage differrence between the OSM street name and the municipality one. If above this percentage, point will be removed."
                sliderMin={0}
                sliderMax={100}
                sliderStep={5}
                sliderDefaultValue={90}
                sliderMarks={ [
                  { value: 0, label: '0 %', },
                  { value: 50, label: '50 %', },
                  { value: 75, label: '75 %', },
                  { value: 90, label: '90 %', },
                  { value: 100, label: '100 %', },
                ] }
                onChangeCommitted={(e, v) => { context.setRefinementParameters({ ...context.refinementParameters, streetSimilarity: v }) }}/>

            </Box>

            <Button 
              sx={{ m:1 }} 
              variant="contained" 
              component="span" 
              onClick={(e) => { this.removeFromMunicipality(context, e) }}
              startIcon={ <WrongLocationIcon/> }
            >
              Remove from municipality
            </Button>

            <Button 
              sx={{ m:1 }} 
              variant="contained" 
              component="span" 
              onClick={(e) => { this.getSimilarPreview(context, e) }}
              startIcon={ <PreviewIcon/> }
            >
              Get similar preview
            </Button>

            <br/>

            <Button 
              sx={{ m:1, mt:3 }} 
              variant="contained" 
              component="span" 
              onClick={(e) => { this.getOSMFile(context, e) }}
              startIcon={ <DownloadIcon/> }
            >
              Generate OSM file
            </Button>

            <Snackbar
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center', }}
              open={context.responseSnackbar.open}
              autoHideDuration={6000}
              onClose={(event, reason) => {
                this.setState({
                  responseSnackbar: {
                    ...context.responseSnackbar,
                    open: false,
                  }
                });
              }}
              message={context.responseSnackbar.message}
            />
            
            <Dialog open={context.compareDialog.open}>
              <DialogTitle>Comparison</DialogTitle>
              <Stack sx={{ mx:3, mb:3 }}>
                { Object.keys(context.compareDialog.result).map((key) => 
                  <Typography key={ key } variant="p" component="div">
                    { key }: { String(context.compareDialog.result[key]) }
                  </Typography>                
                )}
                <Button 
                  component="span" 
                  sx={{ mt:1 }} 
                  onClick={ (e) => { this.setState({ compareDialog: { ...context.compareDialog, open: false } }); } }
                >
                  OK
                </Button>

              </Stack>
            </Dialog>
            
            <Dialog open={ this.state.markersBasePropertiesDialog.open } >
              <DialogTitle>Municipality attributes</DialogTitle>
              <Stack sx={{ mx:3, mb:3 }}>
                
                { context.markersBase.length > 0 && Object.keys(this.state.markersBaseAttrs).map((key) =>
                  <FormControlLabel
                    control={ <Checkbox checked={ this.state.markersBaseAttrs[key] } onChange={ (e) => { this.state.toggleMarkersBaseAttr(key); } }/> }
                    label={ key }
                    key={ `markerBaseAttrs-${key}` }
                  />
                )}

                <Button 
                  component="span"
                  sx={{ mt:1 }}
                  onClick={(e) => {
                    context.setMarkersBaseKeys(Object.keys(Object.fromEntries(Object.entries(this.state.markersBaseAttrs).filter(([k,v]) => v === true))));
                    this.setState({ markersBasePropertiesDialog: { ...this.state.markersBasePropertiesDialog, open: false } });
                  } }
                >
                  OK
                </Button>

              </Stack>
            </Dialog>
            
            <Dialog open={ this.state.markersOSMPropertiesDialog.open } >
              <DialogTitle>OSM attributes { Object.keys(this.state.markersBaseAttrs).length }</DialogTitle>
              <Stack sx={{ mx:3, mb:3 }}>

                { context.markersOSM.length > 0 && Object.keys(this.state.markersOSMAttrs).map((key) =>
                  <FormControlLabel
                    control={ <Checkbox checked={ this.state.markersOSMAttrs[key] } onChange={ (e) => { this.state.toggleMarkersOSMAttr(key); } }/> }
                    label={ key }
                    key={ `markerOSMAttrs-${key}` }
                  />
                )}
                
                <Button 
                  component="span"
                  sx={{ mt:1 }}
                  onClick={(e) => {
                    context.setMarkersOSMKeys(Object.keys(Object.fromEntries(Object.entries(this.state.markersOSMAttrs).filter(([k,v]) => v === true))));
                    this.setState({ markersOSMPropertiesDialog: { ...this.state.markersOSMPropertiesDialog, open: false } });
                  } }
                >
                  OK
                </Button>

              </Stack>
            </Dialog>

          </Box>
        )}
      </AppContext.Consumer>
    );
  }
}

export default SideMenu;
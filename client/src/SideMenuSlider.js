
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import Tooltip from '@mui/material/Tooltip';
import Slider from '@mui/material/Slider';
import React from 'react';

class SideMenuSlider extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      sliderValue: this.props.defaultValue
    }
  }

  render() {
    return(
      <Box sx={this.props.sx}>
        <Typography variant="p" component="div" sx={{ flexGrow: 1 }}>{this.props.title} 
          <Tooltip title={this.props.tooltipText}>
            <IconButton>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Typography>
        <Slider
          aria-label={this.props.title}
          defaultValue={this.props.sliderDefaultValue}
          valueLabelDisplay="auto"
          step={this.props.sliderStep}
          marks={this.props.sliderMarks}
          min={this.props.sliderMin}
          max={this.props.sliderMax}
          onChange={(e, v) => {
            this.setState({ 
              sliderValue: v
            });
          }}
          onChangeCommitted={(e, v) => { this.props.onChangeCommitted(e, v) }}
        />
      </Box>
      
    );
  }

}

export default SideMenuSlider;
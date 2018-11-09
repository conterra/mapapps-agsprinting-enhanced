# AGS Printing Enhanced
The AGS Printing Enhanced Bundle extends the AGS Printing Bundle by further capabilities. You are now able to enter an author to the document and define a scale.
AGS Printing documentation: https://developernetwork.conterra.de/en/documentation/mapapps/39/developers-documentation/ags-printing

![alt text](https://github.com/conterra/mapapps-agsprinting-enhanced/blob/master/printDialog.JPG)


![alt text](https://github.com/conterra/mapapps-agsprinting-enhanced/blob/master/SamplePrinting.JPG)


![alt text](https://github.com/conterra/mapapps-agsprinting-enhanced/blob/master/samplePrint.jpg?s=200)


## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_agsprinting_enhanced/index.html

## Installation Guide
**Requirements:**
- map.apps 3.9.0 or later
- ArcGIS Server 10.4 or later

Simply add the bundle "dn_agsprintingenhanced" to your app.

### Configurable Components of dn_agsprintingenhanced:

#### PrintDialogExtension:
```
"PrintDialogExtension": {
    // hide the DPI selection
    "hideDpiSelection": false,
    // hide the scale checbox
    "hideScaleCheckbox": false,
    // add the help button to show a help widget
    "addHelpButton": true,
    // add the author textfield
    "addAuthorField": true,
    // mapping-table for adjusting the template names
    "templateLabels": {
        "MAP_ONLY": "Karte ohne Layout",
        "A3 Landscape": "A3 Querformat"
    },
    // list of available printing scales -> leave this property out to take the scales from the basemaps LODs
    "printScaleSelectOptions": [
        {
            "label": "1:1.000",
            "value": 1000
        },
        {
            "label": "1:5.000",
            "value": 5000
        },
        {
            "label": "1:10.000",
            "value": 10000
        },
        {
            "label": "1:25.000",
            "value": 25000
        },
        {
            "label": "1:50.000",
            "value": 50000
        },
        {
            "label": "1:100.000",
            "value": 100000
        },
        {
            "label": "1:250.000",
            "value": 250000
        },
        {
            "label": "1:500.000",
            "value": 500000
        },
        {
            "label": "1:1.000.000",
            "value": 1000000
        },
        {
            "label": "1:2.500.000",
            "value": 2500000
        },
        {
            "label": "1:5.000.000",
            "value": 5000000
        },
        {
            "label": "1:10.000.000",
            "value": 10000000,
            "selected": true
        }
    ]
}
```

#### PrintPreviewRenderer:
```
"PrintPreviewRenderer": {
    // enable or disable the upright direction indicator graphic
    "enableUprightDirectionIndicatorGraphic": true
}
```

#### PrintPreviewEditor:
```
"PrintPreviewEditor": {
    // save the print preview after move
    "saveAfterMove": false,
    "saveAfterRotate": false,
    // change the editing modes
    "editModes": [
        [
            "ROTATE",
            "MOVE"
        ]
    ]
}
```

#### HelpWidgetFactory:
```
"HelpWidgetFactory": {
    // define the help widget content
    "content": "<div></div>"
}
```

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`

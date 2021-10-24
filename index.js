/* custom javascript classes to process API data as GeoJSON */

fetchData = async(url, params = '') =>{
    const rawData = await fetch(`${url}${params}`);
    return await rawData.json();
  }

class Feature {
    constructor(id) {
      this.type = 'Feature';
      this.properties = {'ID':id,'label':'','info':'','status':'','val':-1,'units':''};
    }
    id() {return this.properties.ID}
    info() {return this.properties}
    addProp(name,value) {
      try {
        this.properties[name] = value;
        return (`${name}: ${value} added to Feature ID: ${this.id()}`); }
      catch { (`Could NOT add ${name}: ${value}!`) }
    }
    addProps(arr) {
      try { arr.forEach(d => this.properties[d[0]] = d[1])}
      catch { return (`Could NOT add ${arr} to ${this.id()}`) }
    }
  };  

class GeoPoint extends Feature {
    constructor(id,[lon,lat],props = {}) {
      super(id);
      this.properties.EPSG = 4326, this.properties.source = '', this.properties.crs = 'WGS 84';
      this.geometry = {'type':'Point','coordinates':[lon,lat]};
      Object.entries(props).forEach(([d,i]) => (this.properties[d] = i));
    }  
    geo() {return this.geometry.coordinates}
    crs() {return [(`EPSG:${this.properties.EPSG}`),this.properties.crs]}
  };

  class FeatureCollection {
    constructor(meta) {
      this.type = 'FeatureCollection';
      this.metadata = meta;
      this.features = [];
    }
    geoType() { try {return this.features[0].geometry.type}
                catch {return "It doesn't appear their are any features yet..."} }
    fCount() {return this.features.length};
    fProps() {try {return this.features[0].properties}
                catch {return "It doesn't appear their are any features yet..."} }
    fPush(feature) {
      try { this.features.push(feature);
        return `Added Feature Number ${this.fCount()}`; }
      catch { return "Cannot add ${feature} to Feature Collection"} }
  }

/*  from anemowen geoDJango project widget helper library
    cards use bootsrap class categories */

    class Widget {
        constructor(id, clsName, styles, txt) {
          this.div = document.createElement('div');
          this.type = 'Widget';
          this.div.id = id;
          this.childList = [];
          clsName != null ? this.div.className = clsName : '';
          styles != null ? styles.forEach(d => this.div.style[Object.keys(d)]=Object.values(d)) : '';
          txt != null ? this.div.innerText = txt : '';
        }
        getType() {return this.type};
        getID() {return this.div.id};
        addText(txtType, txt, styles) {
          this.text = document.createElement(txtType);
          this.text.innerText = txt; 
          styles != null ? styles.forEach(d => this.text.style[Object.keys(d)]=Object.values(d)) : '';
          this.div.append(this.text);
        }
        addBorder(styles) {
          this.div.style.border = styles;
        }
        addList(txtType, txt, styles) {
          txt.forEach(d => {
            const node = document.createElement(txtType);
            node.appendChild(document.createTextNode(d));
            styles != null ? styles.forEach(d => node.style[Object.keys(d)]=Object.values(d)) : '';
            this.div.append(node);
          }); 
        }
        addChildDiv(id, clsName, styles, txt, divType='div') {
          this.childDiv = document.createElement(divType);
          this.childDiv.id = id;
          clsName != null ? this.childDiv.className = clsName : '';
          styles != null ? styles.forEach(d => this.childDiv.style[Object.keys(d)]=Object.values(d)) : '';
          txt != null ? this.childDiv.innerHTML = txt : '';
          this.div.append(this.childDiv);
        }
        addLastChild(id, clsName, styles, txt) {
          let lastChild = document.createElement('div');
          lastChild.id = id;
          clsName != null ? lastChild.className = clsName : '';
          styles != null ? styles.forEach(d => lastChild.style[Object.keys(d)]=Object.values(d)) : '';
          txt != null ? lastChild.innerHTML = txt : '';
          this.childList.length != 0 ? this.childList[this.childList.length - 1].append(lastChild): this.div.append(lastChild);
          this.childList.push(lastChild);
        }
        addLastChildText(id, clsName, styles, txt, divType='div') {
          let lastChild = document.createElement(divType);
          lastChild.id = id;
          clsName != null ? lastChild.className = clsName : '';
          styles != null ? styles.forEach(d => lastChild.style[Object.keys(d)]=Object.values(d)) : '';
          txt != null ? lastChild.innerHTML = txt : '';
          this.childList.length != 0 ? this.childList[this.childList.length - 1].append(lastChild): this.div.append(lastChild);
          this.childList.push(lastChild);
        }
      };

      const summaryCards = (data) => {
        const cCol = new Widget('','col',[],'');// gridRow = document.querySelector('#gridRow');
        const card = new Widget('','card bg-primary text-white mt-5', [{'width':'400px'}, {'background-image': (`linear-gradient(to right, rgba(255,0,0,0), rgba(0,255,0,.7 ) `)}], '');
        card.addChildDiv('','card-header',[],data[1],);
        const cardT = new Widget('','card-body',[],'');
        cardT.addLastChildText('','card-title',[], data[0],'H1');
        cardT.addChildDiv('','card-text',[],data[2],'P');
        card.div.appendChild(cardT.div);
        cCol.div.appendChild(card.div);
        gridRow.appendChild(cCol.div);
      }
      
      const getAQIcolor = (AQI) => {
        const AQIcolor = (AQI<=50) ? "#29c402" : (AQI<=100) ? "#decc00" : (AQI<=200) ? "#f5b914" : (AQI<=250) ? "#ff3c19" : (AQI<=300) ? "#ff0019" : 
        (AQI<=400) ? "#b30000" : (AQI>500) ? "#5c0000" : "grey";
        return AQIcolor;
      };
      function hexToRGB(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        if (alpha) {
            return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
        } else {
            return "rgb(" + r + ", " + g + ", " + b + ")";
        }
      }

      const stationCards = (data, divID,color) => {
        const rgbaColor = hexToRGB(color, 0), rgbaColor1 = hexToRGB(color, .6);
        const cCol = new Widget('','col',[],'');
        const card = new Widget('','card bg-light mb-0 mt-2 ', [{'width':'260px'},  ], '');
        card.addLastChildText('','card-header',[{'background-image': (`linear-gradient(to right, rgba(255,0,0,0), ${rgbaColor1}`)}, {'text-align':'left'}],data.properties.ID,'div');
        card.addChildDiv('','card-title',[{'text-align':'left'},{'margin-left':'12px'},{'margin-top':'5px'},{'margin-bottom':'0px'}, {'background': 'floralwhite'}],data.properties.label,'H4');
        const cBody = new Widget('','card-body', [{'text-align': 'left'}, {'background': 'floralwhite'}], '');
        cBody.addChildDiv('','card-text', [], (`PM2.5 is <b>${data.properties.PM2_5Value}</b> with an AQI of <b>${data.properties.AQI}</b> 
          The Air Qualiy is <b>${data.properties.AQIText}</b>.</br><b>${data.properties.dayHourMinSecSinceSeen}</b> d/h/m/s since active `),'p');
        cBody.addChildDiv('','card-text text-muted', [], (`1 hr PM2.5 <b>${data.properties.PM2_5_1hour}</b> and 1 hr AQI <b>${data.properties.AQI1Hour}</b></br>
          24 hr PM2.5 <b>${data.properties.PM2_5_24hour}</b> and 24 hr AQI <b>${data.properties.AQI24Hour}</b></br>
          Lon, Lat (<b>${data.geometry.coordinates}</b>)`),'small');
        card.div.appendChild(cBody.div);
        cCol.div.appendChild(card.div);
        document.querySelector(`#${divID}`).appendChild(cCol.div);
     } 
  
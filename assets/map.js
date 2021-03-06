Game.Map = function(tilesGrid){
  this._tiles = tilesGrid;
  this._width = tilesGrid.length;
  this._height = tilesGrid[0].length;
  this.attr = {
    _entitiesByLocation: {},
    _locationsByEntity: {},
    _itemsByLocation: {},
    _locationsByItem: {}
  };
  Game.DATASTORE.MAP = this.attr;
};

Game.Map.prototype.getWidth = function () {
  return this._width;
};

Game.Map.prototype.getHeight = function () {
  return this._height;
};

Game.Map.prototype.getTile = function (x,y) {

  if ((x < 0) || (x >= this._tiles.length -1) || (y<0) || (y >= this._tiles[x].length -1)) {
    return Game.Tile.nullTile;
  }

  return this._tiles[x][y] || Game.Tile.nullTile;
};

Game.Map.prototype.getTileGrid = function(){
  return this._tiles;
}

Game.Map.prototype.setTile = function(x,y, tile){
  if ((x < 0) || (x >= this._width) || (y<0) || (y >= this._height)) {
    return;
  }

  this._tiles[x][y] = tile;
}

Game.Map.prototype.getWalkableLocation = function(){
  var nx = Math.floor(Math.random()*this._width);
  var ny = Math.floor(Math.random()*this._height);

  if(this.getTile(nx,ny).isWalkable()){
    return {x: nx, y: ny};
  }else{
    return this.getWalkableLocation();
  }
}

Game.Map.prototype.getNearWalkableLocation = function(x,y,r){
  var nx = Math.floor(Math.random()*r);
  var ny = Math.floor(Math.random()*r);

  nx = x + (Math.floor(Math.random()*2) == 1 ? nx : -nx);
  ny = y + (Math.floor(Math.random()*2) == 1 ? ny : -ny);

  if(!Game.util.outOfBounds(nx, ny, this._width, this._height) && this.getTile(nx,ny).isWalkable()){
    return {x: nx, y: ny};
  }else{
    return this.getNearWalkableLocation(x,y,r);
  }
}

//Empty locations do not have an item in it
Game.Map.prototype.getEmptyLocation = function(){
  var nx = Math.floor(Math.random()*this._width);
  var ny = Math.floor(Math.random()*this._height);

  if(this.getTile(nx,ny).isEmpty()){
    return {x: nx, y: ny};
  }else{
    return this.getWalkableLocation();
  }
}

Game.Map.prototype.addEntity = function(entity){
    this.attr._entitiesByLocation[entity.getX() + "," + entity.getY()] = entity._entityID;
    this.attr._locationsByEntity[entity._entityID] = entity.getX() + "," + entity.getY();
    // console.log(entity);
    // entity.setMap(this);
}

Game.Map.prototype.pointTraversable = function(x,y){
  return Game.UIMode.gamePlay.attr._map.getTile(x,y).attr._name == "floorTile"; //&& Game.UIMode.gamePlay.attr._map.attr._entitiesByLocation[x+","+y] == null;
}

Game.Map.prototype.getEntity = function(x,y){
    var id = this.attr._entitiesByLocation[x + "," + y];
    return id != null ? Game.DATASTORE.ENTITIES[id] : null;
}

Game.Map.prototype.updateEntity = function(entity){
  var oldloc = this.attr._locationsByEntity[entity._entityID];
  delete this.attr._entitiesByLocation[oldloc];

  this.attr._locationsByEntity[entity._entityID] = entity.getX() + "," + entity.getY();
  this.attr._entitiesByLocation[entity.getX() + "," + entity.getY()] = entity._entityID;
}


Game.Map.prototype.deleteEntity = function(entity){
  var uniqueid = entity._entityID;

  delete this.attr._locationsByEntity[uniqueid];

  for(var k in this.attr._entitiesByLocation) {
    if (this.attr._entitiesByLocation[k] == uniqueid) {
        delete this.attr._entitiesByLocation[k];
        break;
    }
  }
  // var oldloc = this.attr._locationsByEntity[entity._entityID];
  // delete this.attr._entitiesByLocation[oldloc];
  // delete this.attr._locationsByEntity[entity._entityID];
}

Game.Map.prototype.addItem = function(item){
    this.attr._itemsByLocation[item.getX() + "," + item.getY()] = item._itemID;
    this.attr._locationsByItem[item._itemID] = item.getX() + "," + item.getY();
}

Game.Map.prototype.getItem = function(x,y){
    var id = this.attr._itemsByLocation[x + "," + y];
    return id != null ? Game.DATASTORE.ITEMS[id] : null;
}

Game.Map.prototype.updateItem = function(item){
  var oldloc = this.attr._locationsByItem[item._itemID];
  delete this.attr._itemsByLocation[oldloc];
  delete this.attr._locationsByItem[item._itemID];
}

Game.Map.prototype.renderOn = function (display,camX,camY) {

  var dispW = display._options.width;
  var dispH = display._options.height;
  var xStart = camX-Math.round(dispW/2);
  var yStart = camY-Math.round(dispH/2);

  for (var x = 0; x < dispW; x++) {
    for (var y = 0; y < dispH; y++) {
      // Fetch the glyph for the tile and render it to the screen - sub in wall tiles for nullTiles / out-of-bounds
      var tile = this.getTile(x+xStart, y+yStart);
      if (tile.getName() == 'nullTile') {
        tile = Game.Tile.wallTile;
      }

      if(Game.Exit.isExit(x + xStart,y + yStart)){
        Game.Exit.render(display, x, y, xStart, yStart);
        continue;
      }

      if(Game.SavePoint.isSavePoint(x + xStart,y + yStart)){
        Game.SavePoint.render(display, x, y, xStart, yStart);
        continue;
      }

      var activeSym = this.getEntity(x + xStart,y + yStart) || this.getItem(x + xStart,y + yStart);

      if(activeSym == null){
        tile.draw(display,x,y);
      } else {
        activeSym.draw(display,x,y);
      }
    }
  }
};

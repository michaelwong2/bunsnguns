Game.Symbol = function(properties){
  if(!properties){properties = {}}
  if(!('attr' in this)){this.attr = {}}

    this.attr._char = properties.chr || '';
    this.attr._fg = properties.fg || Game.UIMode.DEFAULT_FG;
    this.attr._bg = properties.bg || Game.UIMode.DEFAULT_BG;
}

Game.Symbol.prototype.getChar = function(){
  return this.attr._char;
};

Game.Symbol.prototype.setChar = function(s){
  this.attr._char = s;
};

Game.Symbol.prototype.getFg = function(){
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function(){
  return this.attr._bg;
};

Game.Symbol.prototype.draw =  function(display, x, y){
  display.drawText(x,y,this.attr._char, this.attr._fg, this.attr._bg);
}

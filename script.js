const boardLength = 21;
const storage = {
  rounds: [],
  save: () => {
    localStorage['rounds' + boardLength] = JSON.stringify(storage.rounds);
  },
  unlearn: (round) => {

  },
  saveRound: (round) => {
    storage.rounds.push(round);
    storage.save();
  },
  load: () => {
    var rounds = localStorage['rounds' + boardLength];
    if(rounds) {
      storage.rounds = JSON.parse(rounds);
    } else {
      storage.rounds = [];
    }
  }
};

storage.load();
function Point() {
  this.tag = new Div(32, 32).tag;
  this.tag.style.border = '3px solid black';
  this.tag.style.borderRadius = '50%';
  this.tag.style.display = 'inline-block';
  this.p1Color = 'blue';
  this.p2Color = 'red';
  this.hoverColor = 'gray';
  this.fill = (p) => {
    this.filled = true;
    this.tag.style.backgroundColor = this[p+'Color'];
  };
  this.tag.addEventListener('mouseover', () => {
    if(this.filled) return;
    this.tag.style.backgroundColor = this.hoverColor;
  }, false);
  this.tag.addEventListener('mouseout', () => {
    if(this.filled) return;
    this.tag.style.backgroundColor = 'transparent';
  }, false);
}

function Div(w, h, parent, children) {
  this.tag = document.createElement('div');
  this.tag.style.width = w + 'px';
  this.tag.style.height = h + 'px';

  this.parent = parent || document.body;
  this.children = children || [];
}

function render() {
  if(!this.children || !this.children.length) return;
  this.children.forEach((child) => {
    this.tag.appendChild(child.tag);
  });
  if(!this.parent || !this.parent.appendChild) return;
  this.parent.appendChild(this.tag);
}

Div.prototype.render = render;
Point.prototype.render = render;

const board = [];
for(var i = 0; i < boardLength; i++) {
  board.push(new Point());
}



function State(prevState){
  this.player = prevState.player == 'p1' ? 'p2' : 'p1';
  this.points = board.filter((point) => point.filled).length;
};




const states = [];

states.getPlayer = function() {
  if(!this[this.length -1]) return 'p2';
  return this[this.length -1].player == 'p1' ? 'p2' : 'p1';
}

states.lastState = function() {
  var index = this.length ? this.length - 1 : 0;
  return this[index];
}

function nextTurn() {
  var prevState = states[states.length -1];
  var state = new State(prevState);
  states.push(state);
  if(state.points == boardLength) return endRound();
  if(state.player == 'p2') {
    AITurn();
  }
}

function Round(states, winner, loser) {
  this.id = states.map((state) => state.player + state.points).join('');
  this.states = states;
  this.winner = winner;
  this.lower = loser;
}

const neurons = [];

function pickOther(points) {
  var rand = Math.random() > 0.49 ? 0 : 1;
  var arr = [1,2,3].filter((num) => num != points)
  return arr[rand];
}

Array.prototype.median = function() {
  var legend = {};
  var highest = {number: 1, times: 0};
  this.forEach( (number) => {
    if(number.constructor == Number) {
      legend[number] = legend[number] ? legend[number] + 1 : 1;
      if(legend[number] > highest.times) {
        highest.number = number;
        highest.times = legend[number];
      }
    }
  });
  return highest.number;
};

Array.prototype.lowest = function() {
  var legend = {};
  var lowest = {number: 1, times: 0};
  this.forEach( (number) => {
    if(number.constructor == Number) {
      legend[number] = legend[number] ? legend[number] + 1 : 1;
      if(legend[number] < lowest.times) {
        lowest.number = number;
        lowest.times = legend[number];
      }
    }
  });
  return lowest.number;
};

Array.prototype.of = function(number) {
  return this.filter((n) => n == number).length;

};

function AITurn() {
  var currentState = states.lastState();
  var current = currentState.points;
  var max = boardLength;
  var remaining = max - current;
  var guess = 1;//Math.min(Math.ceil(Math.random() * 3), remaining);
  if(storage.rounds.length) {
    var s;
    // find a state where ai where in this position last time
    var losses = [];
    var wins = [];
    var round = storage.rounds.forEach((round) => {
      return round.states.find((state, i) => {
        // if he won that round, make the same move.
        // if he lost that rounds, make another move.
        var whosTurn = state.player;
        if(state.points != currentState.points) return;
        if(whosTurn == round.winner) {
          var nextIndex = i + 1;
          guess = round.states[nextIndex].points - state.points;
          wins.push(guess);
          return true;
        } else {
          guess = round.states[i+1].points - state.points;
          losses.push(guess);
          return true;
        }
      });
    });
    if(wins.length > losses.of(wins.median()) ) {
      console.log('picked a win', wins);
      guess = wins.median();
    } else {
      console.log('picked a loss', losses);
      guess = pickOther(losses.median());
    }
    console.log('AI made a guess', guess);
  }
  for(var point = current; point < Math.min(max, current + guess); point++) {
    var index = point -1;
    board[point].fill('p2');
  }
  nextTurn();
}

function Turn(player, points) {

}


function endRound() {
  var winner = states.lastState().player;
  var loser = winner == 'p1' ? 'p2' : 'p1';
  var round = new Round(states, winner, loser);
  storage.saveRound(round);
  alert(winner + ' won the game ' + loser + ' lost the game');
}


// start
states.push({player: 'p1', points: 0});
const root = new Div(38 * boardLength, 38, document.body, board);
root.tag.addEventListener('click', function(e) {
  var player = states.getPlayer();
  if(player == 'p1') return;
  var end = e.x;
  var step = 38;
  var state = states.lastState();
  var startPoint = state || state.points ? state.points -1 : 0;
  console.log('startPoint', startPoint);
  var currentPoint = startPoint + 1;
  var endPoint = Math.ceil(end / step);
  if(endPoint - startPoint > 4) return;
  while(currentPoint < endPoint) {
    board[currentPoint].fill('p1');
    ++currentPoint;
  }
  nextTurn();
}, false);
root.render();
var newRoundButton = document.createElement('button');
newRoundButton.textContent = 'NEW ROUND';
newRoundButton.addEventListener('click', () => window.location.href = window.location.href, false);
document.body.appendChild(newRoundButton);

<script>
  import {io} from 'socket.io-client'
  const socket = io('https://backend-ttt.jonx.dev');

  export default {
    name: 'App',
    components: {
    },
    data() {
      return {
        view: "select",
        singleplayer: false,
         
        content: ["", "", "", "", "", "", "", "", ""],
        turn: true,
        isOver: false,
        winner: null,
        isTie: false,

        yourTurn: true,

        lobbyfull: false,

        room: "",
      }
    },
    methods: {
      draw(index, drawFromOther = false) {
        if(this.singleplayer){
          if(this.content[index] != "" || this.isOver){
            return;
          }

          this.turn ? this.content[index] = "X" : this.content[index] = "O";

          this.turn = !this.turn;
          // calculate the winner
          this.calculateWinner();
          this.calculateTie()
        } else {
          if(this.content[index] != "" || this.isOver || !this.yourTurn){
            return;
          }

          this.turn ? this.content[index] = "X" : this.content[index] = "O";

          if (!drawFromOther) {
            socket.emit("play", index);
            this.yourTurn = false;
          } 


          this.turn = !this.turn;
          // calculate the winner
          this.calculateWinner();
          this.calculateTie()
        }
        
      },


      calculateWinner() {
        const WIN_CONDITIONS = [
          // rows
          [0, 1, 2], [3, 4, 5], [6, 7, 8],
          // cols
          [0, 3, 6], [1, 4, 7], [2, 5, 8],
          // diagonals
          [0, 4, 8], [2, 4, 6]
        ];
        for (let i = 0; i < WIN_CONDITIONS.length; i++) {
          let firstIndex = WIN_CONDITIONS[i][0];
          let secondIndex = WIN_CONDITIONS[i][1];
          let thirdIndex = WIN_CONDITIONS[i][2];
          if(this.content[firstIndex] == this.content[secondIndex] &&
                  this.content[firstIndex] == this.content[thirdIndex] &&
                  this.content[firstIndex] != "") {
            this.isOver = true;
            this.winner = this.content[firstIndex];
          }
        }
      },


      calculateTie(){
        for (let i = 0 ; i<= 8 ; i++) {
          if(this.content[i] == "") {
            return;
          }
        }
        this.isTie = true;
      },

      
      resetBoard(_self) {
        if(_self) {socket.emit("reset")}
        for (let i=0; i<= 8; i++) {
          this.content[i] = ""
          this.isOver = false;
          this.winner = null
          this.isTie = false
        }
      },


      HostRoom(){
        socket.emit("host");
        this.view = 'game';
      },

      JoinRoom(){
        socket.emit("joinGame", this.room);
        this.lobbyfull = true;
      },

      CopyToClipboard(txt){
        navigator.clipboard.writeText(txt);
      }
    },

    created(){
      socket.on("test", (msg) => {
        console.log("received msg from server", msg)
      });

      socket.on("play", (index) => {
        console.log("received index", index)
        this.yourTurn = true;
        this.draw(index, true)
      });

      socket.on("reset", () => {
        console.log("received index", "reset")
        this.resetBoard(false);
      })

      socket.on("cantJoinFull", () => {
        alert("cant join Room (Room full)");
      });

      socket.on("cantJoinNotFound", () => {
        alert("cant join Room (Room not Found)");
      });

      socket.on('joined', () => {
        this.view = 'game';
      });

      socket.on('createdRoom', (_room) => {
       this.room = _room;
      });

      socket.on('userJoined', () => {
        this.resetBoard();
        this.lobbyfull = true;
      });

      socket.on('opponentLeft', () => {
        this.resetBoard();
        this.lobbyfull = false;
      });

    },
  }
</script>

<template>

  <div id="select" v-if="view == 'select'">
    <div id="selectWrapper">
      <div class="selectField">
        <button @click="singleplayer = true; view = 'game'">SinglePlayer</button>
      </div>
      <div class="selectField">
        <button @click="HostRoom()">Host Room</button>
      </div>
      <div class="selectField">
        <input type="text" placeholder="room Id" v-model="room"><br>
        <button @click="JoinRoom()">join Room</button>
      </div>

    </div>
  </div>

  <div id="game" v-else>
    <p style="margin: 15px; position: absolute;" class="clickable" v-if="!singleplayer" @click="CopyToClipboard(room)">Room:{{ room }}</p>
    <p style="margin: 15px; position: absolute; right: 0;" v-if="!singleplayer && !lobbyfull">currently waiting for opponent</p>

    <div class="container unmarkable">
      <h1>Tic-Tac-Toe</h1>
      <div class="play-area">
        <div id="block_0" class="block" @click="draw(0)">{{ content[0] }}</div>
        <div id="block_1" class="block" @click="draw(1)">{{ content[1] }}</div>
        <div id="block_2" class="block" @click="draw(2)">{{ content[2] }}</div>
        <div id="block_3" class="block" @click="draw(3)">{{ content[3] }}</div>
        <div id="block_4" class="block" @click="draw(4)">{{ content[4] }}</div>
        <div id="block_5" class="block" @click="draw(5)">{{ content[5] }}</div>
        <div id="block_6" class="block" @click="draw(6)">{{ content[6] }}</div>
        <div id="block_7" class="block" @click="draw(7)">{{ content[7] }}</div>
        <div id="block_8" class="block" @click="draw(8)">{{ content[8] }}</div> 
      </div>

      <h2 id="winner" v-if="isOver"> Winner is {{winner}} </h2>
      <h2 v-if="isTie"> Game is Tie</h2>

      <button @click="resetBoard(true); " v-if="isOver || isTie">RESET BOARD</button>
    </div>
  </div>
  
</template>


<style>
  * {
    color: white;

    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: Arial, Helvetica, sans-serif;
  }
  .container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  h1 {
    font-size: 5rem;
    margin-bottom: 0.5em;
  }
  h2 {
    margin-top: 1em;
    font-size: 2rem;
    margin-bottom: 0.5em;
  }
  .play-area {
    display: grid;
    width: 300px;
    height: 300px;
    grid-template-columns: auto auto auto;
  }
  .block {
    display: flex;
    width: 100px;
    height: 100px;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    font-weight: bold;
    border: 3px solid rgb(255, 255, 255);
    transition: background 0.2s ease-in-out;
  }
  .block:hover {
    cursor: pointer;
    background: #0ff30f;
  }
  .occupied:hover {
    background: #ff3a3a;
  }
  .win {
    background: #0ff30f;
  }
  .win:hover {
    background: #0ff30f;
  }
  #block_0,
  #block_1,
  #block_2 {
    border-top: none;
  }
  #block_0,
  #block_3,
  #block_6 {
    border-left: none;
  }
  #block_6,
  #block_7,
  #block_8 {
    border-bottom: none;
  }
  #block_2,
  #block_5,
  #block_8 {
    border-right: none;
  }
  #game button {
    outline: none;
    border: 4px solid green;
    padding: 10px 20px;
    font-size: 1rem;
    font-weight: bold;
    background: none;
    transition: all 0.2s ease-in-out;
  }
  button:hover {
    cursor: pointer;
    background: green;
    color: white;
  }
  .playerWin {
    color: green;
  }
  .computerWin {
    color: red;
  }
  .draw {
    color: orangered;
  }


  /* select */
  #select{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    text-align: center;
  }

  .selectField{
    margin: 20px;
  }

  .selectField button{
    background-color: transparent;
    border: 3px solid white;
    padding: 5px;
    width: 120px;
  }

  .selectField input{
    margin-top: 10px;
    background-color: transparent; 
    border: none; 
    border-bottom: 1px solid white; 
    text-align: center;
    margin-bottom: 5px;
  }






  .unmarkable{
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .clickable{
    cursor: pointer;
  }

  @media only screen and (max-width: 600px) {
    h1 {
      font-size: 3rem;
      margin-bottom: 0.5em;
    }
    h2 {
      margin-top: 1em;
      font-size: 1.3rem;
    }
  }
</style>
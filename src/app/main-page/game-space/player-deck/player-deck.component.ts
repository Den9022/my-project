import { Component, OnInit, Input } from '@angular/core';
import { CardVo } from 'src/app/vo/card-vo';

@Component({
  selector: 'app-player-deck',
  templateUrl: './player-deck.component.html',
  styleUrls: ['./player-deck.component.scss']
})
export class PlayerDeckComponent {

  @Input()
  playerName: string;

  @Input()
  isMyTeammate: boolean;

  @Input()
  isOtherPlayer: boolean;

  @Input()
  cards: CardVo[];

  @Input()
  blindCards: CardVo[];

  constructor() { }

  init() {

  }

}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';

type tipoHorario = 'manha'| 'tarde'| 'noite'


@Component({
  selector: 'app-filtros',
  templateUrl: './filtros.component.html',
  styleUrls: ['./filtros.component.scss']
})
export class FiltrosComponent implements OnInit{
  
  resultados: any = []

  qtdResultados = 0

  show = false

  form = new FormGroup({
    fechadas: new FormControl(false, []),
    opcao: new FormControl('',[Validators.required])
  })

  legend = [{
    nome: 'Máscara',
    img: [{
      url: 'required-mask.png',
      desc: 'Obrigatório'
    },
    {
      url: 'recommended-mask.png',
      desc: 'Recomendado'
    },]
  },
  {
    nome: 'Toalha',
    img: [{
      url: 'required-towel.png',
      desc: 'Obrigatório'
    },
    {
      url: 'recommended-towel.png',
      desc: 'Recomendado'
    },]
  },
  {
    nome: 'Bebedouro',
    img: [{
      url: 'partial-fountain.png',
      desc: 'Parcial'
    },
    {
      url: 'not_allowed-fountain.png',
      desc: 'Proibido'
    },]
  },
  {
    nome: 'Vestiários',
    img: [{
      url: 'allowed-lockerroom.png',
      desc: 'Obrigatório'
    },
    {
      url: 'partial-lockerroom.png',
      desc: 'Liberado'
    },{
      url: 'closed-lockerroom.png',
      desc: 'Fechado'
    }]
  }]

  horarios = {
    'manha': {ini: 6, fim: 12},
    'tarde': {ini: 12, fim: 18},
    'noite': {ini: 18, fim: 23},
  }

  constructor(private httpClient: HttpClient){}

  ngOnInit(){
    this.form.statusChanges?.subscribe(ev => {
      setTimeout(()=>{
        if(this.form.pristine){
          this.qtdResultados = 0
          this.show = false
        }
      },0)
    })
  }

  getDia(){
    let wd = "Seg. à Sex."
    switch (moment().weekday()){
      case 0: wd = 'Dom.'; break;
      case 6: wd =  'Sáb.'; break;
      default: wd = "Seg. à Sex."; break;
    }
    return wd
  }

  valHorario(hr: any){
    if(hr == 'Fechada') return false
    let hora = hr.split(' às ')
    let hrinicio = parseInt(hora[0].replace('h',''))
    let hrfim = parseInt(hora[1].replace('h',''))
    let hrsel = this.horarios[this.form.controls.opcao.value as tipoHorario]
    
    if(hrsel === undefined || (hrsel.ini >= hrinicio && hrsel.ini <= hrfim) || (hrsel.fim >= hrinicio && hrsel.fim <= hrfim)){
      return true
    }

    
    return false
  }
  
  filtraHorario(sch: any){
    let ret = false
    if(sch){
      sch.forEach((horario: any) => ret = this.valHorario(horario.hour))
    }
    
    return ret

  }

  async filtrar(){
    await this.httpClient.get<any>('https://test-frontend-developer.s3.amazonaws.com/data/locations.json').subscribe(data => {
      this.resultados = data.locations
      this.resultados = this.resultados.filter((unidade: any) => {        
        
        if(!this.form.controls.fechadas.value && !unidade.opened){
          return false
        }

        if(unidade.schedules && this.filtraHorario(unidade.schedules.filter((sch: any) => sch.weekdays == this.getDia()))){          
          return true
        }

        this.show = true
        return false
      })
      console.log(this.resultados)
      this.qtdResultados = this.resultados.length

    })
  }

}

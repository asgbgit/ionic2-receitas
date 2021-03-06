import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController, ToastController } from 'ionic-angular';
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { ReceitaService } from "../../services/receita.service";
import { Receita } from "../../models/receita";
import { MensagemService } from "../../services/mensagem.service";

@Component({
  selector: 'page-edita-receita',
  templateUrl: 'edita-receita.html'
})

export class EditaReceitaPage {
 
  mode = 'Nova';
  index: number;
  receita: Receita;
  niveisDificuldade = ['Fácil', 'Média', 'Difícil'];
  formReceita: FormGroup;
  
  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    private receitasService: ReceitaService,
    private actionSheetController: ActionSheetController,
    private toastController: ToastController,
    private alertController: AlertController,
    private mensagemService: MensagemService) {
    this.mode = this.navParams.get('mode');
    if (this.mode == 'Altera') {
       this.index = this.navParams.get('index');
       this.receita = this.navParams.get('receita');
    }
    this.iniciaForm();
  }

  private iniciaForm() {
    let nome=null;
    let descricao=null;
    let dificuldade = 'Média';
    let ingredientes = [];

    if (this.mode == 'Altera') {
       nome = this.receita.nome;
       descricao = this.receita.descricao;
       dificuldade = this.receita.dificuldade;
       for (let ingrediente of this.receita.ingredientes) {
         ingredientes.push(new FormControl(ingrediente.nome, Validators.required));
       }
    }

    this.formReceita=new FormGroup({
      'nome': new FormControl(nome, Validators.required),
      'descricao': new FormControl(descricao, Validators.required),
      'dificuldade': new FormControl(dificuldade, Validators.required),
      'ingredientes': new FormArray(ingredientes)
    });
  }

  envia() {
    const value = this.formReceita.value;
    let ingredientes = [];
   
    if (value.ingredientes.length > 0) {
      ingredientes = value.ingredientes.map(nome => {
        return {nome: nome, quantidade: 1};
      });
    }

    if (this.mode == 'Altera') {
      this.receitasService.alteraReceita(this.index, value.nome, value.descicao, value.dificuldade, ingredientes)
    } else {
      this.receitasService.adicionaReceita(value.nome, value.descicao, value.dificuldade, ingredientes);
    }

    this.formReceita.reset();
    this.navCtrl.popToRoot();
  }

  removeIngrediente (index: number) {
    console.log("removeIngrediente");
    const fArray: FormArray = <FormArray>this.formReceita.get('ingredientes');
    fArray.removeAt(index);
  }

  editaIngredientes() {
    const actionSheet = this.actionSheetController.create({
      title: 'Escolha uma opção',
      buttons: [
        {
          text: 'Adiciona ingrediente',
          handler:() => {
            this.criaAlertaNovoIngrediente().present();
          }
        },
        {
          text: 'Remove todos ingredientes',
          role: 'destructive',
          handler:() => {
            const fArray: FormArray = <FormArray>this.formReceita.get('ingredientes');
            const  len = fArray.length;
            if (len >0) {
              for (let i = len - 1; i >= 0; i--) {
                fArray.removeAt(i);
              }
              this.mensagemService.showMessage('Todos ingrediente removidos');
            }
          }
        },
        {
          text: 'Cancela',
          role: 'cancel'
        }
        ]
    });
    actionSheet.present();
  }
  private criaAlertaNovoIngrediente() {
    return this.alertController.create({
      title: 'Adiciona Ingrediente',
      inputs: [
        {
          name: 'nome',
          placeholder: 'Nome'
        }
      ],
      buttons: [
        {
          text: 'Cancela',
          role: 'cancel'
        },
        {
          text: 'Adiciona',
          handler: data => {
            if (data.nome.trim() == '' || data.nome == null) {
              this.mensagemService.showMessage('Entre com um valor válido!');
            }
            (<FormArray>this.formReceita.get('ingredientes'))
              .push(new FormControl(data.nome, Validators.required));
              this.mensagemService.showMessage('Ingrediente adicionado com sucesso');
          }
        }
      ]
    });
  }

}
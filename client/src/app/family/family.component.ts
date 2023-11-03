import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FamilyService } from '../family.service';
import { Subscription, switchMap, catchError, throwError  } from 'rxjs';
import { ModalService } from '../modal.service';
import { PersonService } from '../person.service';
import { DialogService } from '../dialog.service';
import { HttpErrorResponse } from '@angular/common/http';


interface Node {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  birthyear: number;
  living: string;
  partner: Node | null;
  children: Node[];
  parent: Node | null;
  width: number;

}

@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.css']
})
export class FamilyComponent implements OnInit, OnDestroy {
  id: number = 0;
  currentPerson: any;
  selectedNode: Node | null = null;
  selectedId: number = 0;
  familyTree: Node[] = [];
  menuOptions: string[] = ['Add Parent', 'Add Children', 'Edit Info', 'Go to info page'];
  subscription!: Subscription;
  title = "Title";
  constructor(
    private route: ActivatedRoute,
    private familyService: FamilyService,
    private modalService: ModalService,
    private personService: PersonService,
    private dialogService: DialogService,
    private router: Router) { }

  ngOnInit() {
    this.subscription = this.route.params.subscribe(params => {
      this.id = +params['id'];
      this.personService.getCurrentPerson().subscribe(person => {
        this.currentPerson = person;
      })
      this.familyService.getFamilyTree(this.id).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.router.navigate(['/home']);
          }
          return throwError(() => error);
        })
      ).subscribe(tree => {
        this.familyTree = tree;
        console.log(tree);
      });
      
      this.familyService.getFamilyName(this.id).subscribe(res => {
        this.title = res.name;
      })
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }



  editFamilyName(event: Event) {
    if (this.isAuthorize()) {
      this.dialogService.inputDialog("Change family's name?").subscribe(name => {
        if (name) {
          this.familyService.editFamilyName(this.id, name).subscribe(familyName => {
            this.title = name;
          })
        }
      })
    }
  }
  selectNode(event: Event, node: Node) {
    this.selectedId = node.id;
    this.toggleSelectBar(event, node);
  }
  selectPartner(event: Event, node: Node) {
    this.selectedId = node.partner!.id
    this.toggleSelectBar(event, node);
  }
  toggleSelectBar(event: Event, node: Node) {
    event.stopPropagation();
    if (this.selectedNode === node) {
      this.selectedNode = null; // If the clicked node is already selected, deselect it
    } else {
      this.selectedNode = node; // Otherwise, select the clicked node
    }
  }
  handleOptionSelected(option: string, node: Node) {
    if (option == 'Go to info page'){
      this.router.navigate(['/person/' + this.selectedId])
      return;
    }
    if (this.isAuthorize()) {
      this.selectedNode = null;
      if (option == "Add Partner") {
        this.selectedId = node.id
      }
      this.personService.getPersonById(this.selectedId).pipe(
        switchMap(person => {
          this.modalService.openPerson(person, option);
          return this.modalService.onClose$; 
        })
      ).subscribe(() => {
        this.familyService.getFamilyTree(this.id).subscribe(tree => {
          this.familyTree = tree;

        });
      });
    }
  }

  shouldDisableOption(node: Node): (option: String) => boolean {
    return (option: String) => {
      if (option == "Go to info page") return false;
      if (!this.isAuthorize()) {
        return true;
      }
      if (node.parent && option == "Add Parent") {
        return true;
      }
      return false;
    };
  }
  isAuthorize(): boolean {
   return this.currentPerson.family_id == this.id;
  }

}

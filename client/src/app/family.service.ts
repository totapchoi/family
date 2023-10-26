import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Node {
  id: number;
  firstname: string;
  lastname: string;
  gender : string;
  living : string;
  birthyear: number;
  partner: Node | null;
  children: Node[];
  parent: Node | null; 
  width : number,
}

@Injectable({
  providedIn: 'root'
})
export class FamilyService {

  constructor(private http: HttpClient) { }

  create(id: number): Observable<any> {
    return this.http.post<any>(`/api/family/${id}`, {});
  }
  getFamilyName(id: number): Observable<any> {
    return this.http.get<any>(`/api/family/${id}/name`);
  }
  editFamilyName(id: number, name: string): Observable<any> {
    return this.http.put<any>(`/api/family/${id}/name`, { name });
  }
  
  getFamilyTree(familyId: number): Observable<Node[]> {
    return this.http.get<{persons: any[], parentRelations: any[]}>(`/api/familyTree/${familyId}`).pipe(
      map(data => this.transformData(data.persons, data.parentRelations))
    );
  }

  transformData(persons: any[], parentRelations: any[]): Node[] {
    const tree: Node[] = [];
    const processedIds: Set<number> = new Set(); // Track processed person IDs
  
    persons.forEach(person => {
      // Skip if person has already been processed
     let currentLiving : string = 'Living'
     if (person.living == 0){
      currentLiving = 'Deceased';
     }
      if (processedIds.has(person.id)) {
        return;
      }
      
      const node: Node = {
        id: person.id,
        firstname: person.firstName,
        lastname: person.lastName,
        gender : person.gender,
        birthyear: person.birthyear,
        living : currentLiving,
        partner: null,
        children: [],
        parent: null,
        width: 0,
      };
  
      // Find the partner of the current person
      const partner = persons.find(p => p.id === person.partner_id);

      if (partner) {
        let partnerLiving : string = 'Living';
        if (partner.living == 0){
          partnerLiving = 'Deceased';
        }
        node.partner = {
          id: partner.id,
          firstname: partner.firstName,
          lastname: partner.lastName,
          gender :partner.gender,
          birthyear: partner.birthyear,
          living: partnerLiving,
          partner: node, // Connect partner to the current person
          children: [],
          parent: null,
          width: 0,
        };
        processedIds.add(partner.id);
      }
  
      tree.push(node);
      processedIds.add(person.id);
    });
    
    parentRelations.forEach(parentRelation => {
      const parent = tree.find(node => node.id === parentRelation.parent_id);
      const child = tree.find(node => node.id === parentRelation.child_id);
  
      if (parent && child) {
        parent.children.push(child);
        child.parent = parent;
      }
    });
  
    const rootNodes = tree.filter(node => !node.parent );
  
    
    return rootNodes;
  }
  
  
  
  
  
  
}

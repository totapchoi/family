import { HttpClient , HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { switchMap, map } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  constructor(private http: HttpClient, private userService: UserService) {}

  list() {
    return this.http.get<any[]>('/api/persons/').subscribe(persons => {
      if (persons) {
        const promises = persons.map(person => {
          return this.http.get(`/api/images/${person.image}`, { responseType: 'blob' }).subscribe(blob => {
            if (blob) {
              const objectURL = URL.createObjectURL(blob);
              person.imageURL = objectURL;
            } else{
              person.imageURL = 'assets/default.jpeg';
            }
            return person;
          });
        });
        return Promise.all(promises);
      } else {
        return [];
      }
    });
  }
  
  getPersonById(id: number) {
    return this.http.get<any>(`/api/persons/${id}`).pipe(
      switchMap(person => {
        if (person.image) {
          return this.http.get(`/api/images/${person.image}`, { responseType: 'blob' }).pipe(
            map(blob => {
              if (blob) {
                const objectURL = URL.createObjectURL(blob);
                person.imageURL = objectURL;
              } else {
                person.imageURL = 'assets/default.jpeg';
              }
              return person;
            })
          );
        } else {
          person.imageURL = 'assets/default.jpeg';
          return of(person);
        }
      })
    );
  }
  
  

  deletePersonById(id: number) {
    return this.http.delete(`/api/persons/${id}`);
  }

  createPerson(person: any, image: File) {
    const formData = new FormData();
    this.appendPersonDetailsToFormData(formData, person);
    if (image) {
      formData.append('image', image, image.name);
    }
  
    return this.http.post('/api/persons', formData);
  }
  
  editPerson(id: number, person: any, image: File) {
    const formData = new FormData();
    this.appendPersonDetailsToFormData(formData, person);
    if (image) {
      formData.append('image', image, image.name);
    }
  
    return this.http.put(`/api/persons/${id}`, formData);
  }
  addChildren(parentId: number, child: any, image: File) {
    const formData = new FormData();
    this.appendPersonDetailsToFormData(formData, child);
    if (image) {
      formData.append('image', image, image.name);
    }

    return this.http.post(`/api/child/${parentId}`, formData);
  }

  addParent(childId: number, parent: any, image: File) {
    const formData = new FormData();
    this.appendPersonDetailsToFormData(formData, parent);
    if (image) {
      formData.append('image', image, image.name);
    }

    return this.http.post(`/api/parent/${childId}`, formData);
  }
  private appendPersonDetailsToFormData(formData: FormData, person: any) {
    if (person) {
      formData.append('firstName', person.firstName);
      formData.append('lastName', person.lastName);
      formData.append('gender', person.gender);
      formData.append('birthyear', person.birthyear);
      formData.append('living', person.living);
      formData.append('public', person.public);
    }
  }
  addPartner(partnerId: number, partner: any, image: File) {
    const formData = new FormData();
    this.appendPersonDetailsToFormData(formData, partner);
    if (image) {
      formData.append('image', image, image.name);
    }
  
    return this.http.post(`/api/partner/${partnerId}`, formData);
  }
  
  search(query: string) {
    const params = new HttpParams().set('query', query);
    return this.http.get<any[]>('/api/person/search', { params });
  }
  getCurrentPerson() {
    return this.userService.getCurrentUser().pipe(
      switchMap(user => {
        const id = user.person_id;
        return this.getPersonById(id);
      })
    );
  }
  getParents(id : number){
    return this.http.get<any[]>(`/api/person/parent/${id}`).pipe(
      switchMap(parents => {
        if (parents) {
          const promises = parents.map(parent => {
            if (parent.image) {
              return this.http.get(`/api/images/${parent.image}`, { responseType: 'blob' }).pipe(
                map(blob => {
                  const objectURL = URL.createObjectURL(blob);
                  parent.imageURL = objectURL;
                  return parent;
                })
              );
            } else {
              parent.imageURL = 'assets/default.jpeg';
              return of(parent);
            }
          });
          return forkJoin(promises);
        } else {
          return of([]);
        }
      })
    );
  }
  
  getChildren(id : number){
    return this.http.get<any[]>(`/api/person/children/${id}`).pipe(
      switchMap(children => {
        if (children) {
          const promises = children.map(child => {
            if (child.image) {
              return this.http.get(`/api/images/${child.image}`, { responseType: 'blob' }).pipe(
                map(blob => {
                  const objectURL = URL.createObjectURL(blob);
                  child.imageURL = objectURL;
                  return child;
                })
              );
            } else {
              child.imageURL = 'assets/default.jpeg';
              return of(child);
            }
          });
          return forkJoin(promises);
        } else {
          return of([]);
        }
      })
    );
  }
  
  
}

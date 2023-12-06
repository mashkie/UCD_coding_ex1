import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Kindergarden } from './interfaces/Kindergarden';
import { StoreService } from './store.service';
import { Child, ChildResponse } from './interfaces/Child';
import { CHILDREN_PER_PAGE } from './constants';
import { tap } from 'rxjs/operators';
import { SnackbarService } from './snackbar.service';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    private http: HttpClient,
    private storeService: StoreService,
    private snackbarService: SnackbarService,
  ) {}

  public getKindergardens() {
    this.http
      .get<Kindergarden[]>('http://localhost:5000/kindergardens')
      .subscribe((data) => {
        this.storeService.kindergardens = data;
      });
  }

  public getChildren(page: number) {
    this.http
      .get<ChildResponse[]>(
        `http://localhost:5000/childs?_expand=kindergarden&_page=${page}&_limit=${CHILDREN_PER_PAGE}`,
        { observe: 'response' },
      )
      .pipe(tap(() => (this.storeService.isLoading = true)))
      .subscribe((data) => {
        this.storeService.isLoading = false;
        this.storeService.children = data.body!;
        this.storeService.childrenTotalCount = Number(
          data.headers.get('X-Total-Count'),
        );
      });
  }

  public addChildData(child: Child, page: number) {
    this.http
      .post('http://localhost:5000/childs', child)
      .pipe(tap(() => (this.storeService.isLoading = true)))
      .subscribe((_) => {
        this.storeService.isLoading = false;
        this.snackbarService.openSnackBar('Kind wurde erfolgreich hinzugefügt');
        this.getChildren(page);
      });
  }

  public deleteChildData(childId: string, page: number) {
    this.http
      .delete(`http://localhost:5000/childs/${childId}`)
      .pipe(tap(() => (this.storeService.isLoading = true)))
      .subscribe((_) => {
        this.storeService.isLoading = false;
        this.getChildren(page);
      });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiKey = '280a2c8b5a02f0003539c832cf3b50d8';
  private apiUrl = 'https://api.themoviedb.org/3';

  constructor(private http: HttpClient) {}

  getAllMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/popular?language=en-US&page=1&api_key=${this.apiKey}`);
  }
  
  getAllSeris(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tv/popular?language=en-US&page=1&api_key=${this.apiKey}`);
  }
  getMovieVideos(movieId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/${movieId}/videos?language=en-US&api_key=${this.apiKey}`);
  }
  getSeriesVideos(seriesId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tv/${seriesId}/videos?language=en-US&api_key=${this.apiKey}`);
  }
}

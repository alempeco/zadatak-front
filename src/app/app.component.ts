import { Component, OnInit } from '@angular/core';
import { MovieService } from './movie.service';
import { Subject, debounceTime } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  trendingMovies: any[] = [];
  trendingTVShows: any[] = [];
  filteredMovies: any[] = [];
  filteredTVShows: any[] = [];
  activeTab: 'movies' | 'tvShows' | null = 'movies';
  previousTab: 'movies' | 'tvShows' | null = null;
  searchText: string = '';
  private searchTextChanged = new Subject<string>();
  selectedMovie: any;
  selectedSeries: any;
  videoKey: string | null = null;
  safeUrl: any;
  movieClicked: boolean = false;
  seriesClicked: boolean = false;



  constructor(
    private movieService: MovieService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadMovies();
    this.loadTVShows();
    this.searchTextChanged
      .pipe(
        debounceTime(1000)
      )
      .subscribe(() => {
        this.search();
      });
  }

  loadMovies(): void {
    this.movieService.getAllMovies().subscribe((data: any) => {
      this.trendingMovies = data.results
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, 10);
      /* console.log(this.trendingMovies); */
      this.filteredMovies = [...this.trendingMovies];
      /* console.log(this.filteredTVShows); */
    });
  }

  loadTVShows(): void {
    this.movieService.getAllSeris().subscribe((data: any) => {
      this.trendingTVShows = data.results
        .sort((a: any, b: any) => b.vote_average - a.vote_average)
        .slice(0, 10);
      this.filteredTVShows = [...this.trendingTVShows];
    });
  }

  switchTab(tab: 'movies' | 'tvShows'): void {
    if (this.activeTab !== tab) {
      this.activeTab = tab;
      this.previousTab = this.activeTab;
      if (this.searchText.trim().length > 0) {
        this.search();
      } else {
        this.clearSearch();
      }
    }
  }

  search(): void {
    if (this.searchText.length < 3) {
      // Ako je unos manji od 3 znaka, prikaži prvih 10 filmova ili TV emisija
      if (this.activeTab === 'movies') {
        this.filteredMovies = this.trendingMovies.slice(0, 10);
      } else if (this.activeTab === 'tvShows') {
        this.filteredTVShows = this.trendingTVShows.slice(0, 10);
      }
    } else {
      // Inače, izvrši pretraživanje na osnovu unesenog teksta
      if (this.activeTab === 'movies') {
        this.filteredMovies = this.trendingMovies.filter((movie) =>
          movie.title.toLowerCase().includes(this.searchText.toLowerCase())
        );
      } else if (this.activeTab === 'tvShows') {
        this.filteredTVShows = this.trendingTVShows.filter((tvShow) =>
          tvShow.name.toLowerCase().includes(this.searchText.toLowerCase())
        );
      }
    }
  }

  clearSearch(): void {
    // Resetiraj unos i prikaži prvih 10 filmova ili TV emisija
    this.searchText = '';
    if (this.activeTab === 'movies') {
      this.filteredMovies = this.trendingMovies.slice(0, 10);
    } else if (this.activeTab === 'tvShows') {
      this.filteredTVShows = this.trendingTVShows.slice(0, 10);
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchTextChanged(event: any): void {
    // Emitiranje promjene teksta pretraživanja kad korisnik prestane tipkati
    this.searchTextChanged.next(this.searchText);
  }

  redirectToMovieDetails(movieId: number): void {
    this.movieClicked = true;
    // Pronalazak odgovarajućeg filma iz niza trendingMovies
    const selectedMovie = this.trendingMovies.find(
      (movie) => movie.id === movieId
    );
    if (selectedMovie) {
      // Postavljanje odabranog filma u selectedMovie
      this.selectedMovie = selectedMovie;
      // Sakrivanje div-a koji prikazuje sve filmove
      this.activeTab = null;

      // Dobavljanje informacija o video najavi za odabrani film
      this.movieService
        .getMovieVideos(selectedMovie.id)
        .subscribe((data: any) => {
          /* console.log(data); */
          // Provjera postojanja video najave
          if (data.results && data.results.length > 0) {
            // Ako postoji video najava uzet cu prvu iz arraya,jer ima filmova po 50 video najava
            this.videoKey = data.results[0].key;
            //problem sigurnosti
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              'https://www.youtube.com/embed/' + this.videoKey
            );
          }
        });
    }
  }
  redirectToSeriesDetails(seriesId: number): void {
    this.seriesClicked = true;
    // Pronalazak odgovarajuće serije iz niza trendingTVShows
    const selectedSeries = this.trendingTVShows.find(
      (series) => series.id === seriesId
    );
    if (selectedSeries) {
      // Postavljanje odabrane serije u selectedSeries
      this.selectedSeries = selectedSeries; // Promijenjena varijabla na selectedSeries
      // Sakrivanje div-a koji prikazuje sve serije
      this.activeTab = null;
      
  
      // Dobavljanje informacija o video najavi za odabranu seriju
      this.movieService
        .getSeriesVideos(selectedSeries.id)
        .subscribe((data: any) => {
        //console.log(data);
          // Provjera postojanja video najave
          if (data.results && data.results.length > 0) {
            // Ako postoji video najava, uzmi prvu iz arraya 
            //mozda sam mogao traziti po official: true, pa ako nema officialnog da nikako ne prikazuje
            //video nego da ostavi sliku u htmlu mozda?
            //console.log(data.results);
            this.videoKey = data.results[0].key;
            // Postavljanje sigurnog URL-a
            this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              'https://www.youtube.com/embed/' + this.videoKey
            );
          }
        });
    }
  }
  
  goBack(): void {
    this.movieClicked = false;
    this.seriesClicked = false;
    //console.log(this.previousTab); 
    if (this.previousTab) {
      this.activeTab = this.previousTab;
      this.previousTab = null;
    } else {
      this.activeTab = 'movies'; 
    }
  }
  
  
}

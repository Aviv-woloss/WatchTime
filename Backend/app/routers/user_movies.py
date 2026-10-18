from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.favorite_movie import FavoriteMovie
from app.models.watchlist_movie import WatchlistMovie
from app.schemas.user_movies import UserMovieCreate, UserMovieResponse

router = APIRouter(prefix="/api/user-movies", tags=["user-movies"])

@router.post("/favorites", response_model=UserMovieResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(payload: UserMovieCreate, current_user: User = Depends(get_current_user)):
    fav = FavoriteMovie(
        user=current_user,
        tmdb_id=payload.tmdb_id,
        title=payload.title,
        release_year=payload.release_year
    )
    await fav.insert()
    return UserMovieResponse(id=str(fav.id), tmdb_id=fav.tmdb_id, title=fav.title, release_year=fav.release_year)

@router.get("/favorites", response_model=list[UserMovieResponse])
async def get_favorites(current_user: User = Depends(get_current_user)):
    favorites = await FavoriteMovie.find(FavoriteMovie.user.id == current_user.id).to_list()
    return [UserMovieResponse(id=str(f.id), tmdb_id=f.tmdb_id, title=f.title, release_year=f.release_year) for f in favorites]

@router.post("/watchlist", response_model=UserMovieResponse, status_code=status.HTTP_201_CREATED)
async def add_watchlist(payload: UserMovieCreate, current_user: User = Depends(get_current_user)):
    watch = WatchlistMovie(
        user=current_user,
        tmdb_id=payload.tmdb_id,
        title=payload.title,
        release_year=payload.release_year
    )
    await watch.insert()
    return UserMovieResponse(id=str(watch.id), tmdb_id=watch.tmdb_id, title=watch.title, release_year=watch.release_year)

@router.get("/watchlist", response_model=list[UserMovieResponse])
async def get_watchlist(current_user: User = Depends(get_current_user)):
    watchlist = await WatchlistMovie.find(WatchlistMovie.user.id == current_user.id).to_list()
    return [UserMovieResponse(id=str(w.id), tmdb_id=w.tmdb_id, title=w.title, release_year=w.release_year) for w in watchlist]

@router.delete("/favorites/{tmdb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(tmdb_id: int, current_user: User = Depends(get_current_user)):
    fav = await FavoriteMovie.find_one(
        FavoriteMovie.user.id == current_user.id,
        FavoriteMovie.tmdb_id == tmdb_id
    )
    if not fav:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")
    await fav.delete()
    return None

@router.delete("/watchlist/{tmdb_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_watchlist(tmdb_id: int, current_user: User = Depends(get_current_user)):
    watch = await WatchlistMovie.find_one(
        WatchlistMovie.user.id == current_user.id,
        WatchlistMovie.tmdb_id == tmdb_id
    )
    if not watch:
        raise HTTPException(status_code=404, detail="Movie not found in watchlist")
    await watch.delete()
    return None
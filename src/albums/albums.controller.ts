import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import { AlbumsService } from './albums.service';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentArtistManager } from '../artist-managers/decorators/current-artist-manager.decorator';
import { AlbumCreationValidationPipe } from '../pipes/album-creation-validation.pipe';
import { FileType } from '../types/file.type';
import { ArtistManger } from '../artist-managers/artist-manager.entity';
import { CreateAlbumDto } from './dtos/create-album.dto';

@Controller('albums')
export class AlbumsController {
  constructor(private albumsService: AlbumsService) {}

  @Get()
  fetchAlbums() {
    return this.albumsService.get();
  }

  @Post('create')
  @UseGuards(AuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @CurrentArtistManager() artistManager: ArtistManger,
    @UploadedFiles(new AlbumCreationValidationPipe()) files: FileType[],
    @Body() body: CreateAlbumDto,
  ) {
    return this.albumsService.create(artistManager, files, body);
  }

  @Get('/:id')
  getAlbumWithSongs(@Param('id') id) {
    return this.albumsService.getAlbumWithSongs(id);
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Artist } from './artist.entity';
import { Repository } from 'typeorm';
import { FileType } from '../types/file.type';
import { saveFile } from '../lib/save-file';
import { ArtistManger } from '../artist-managers/artist-manager.entity';

@Injectable()
export class ArtistsService {
  constructor(@InjectRepository(Artist) private repo: Repository<Artist>) {}

  create(
    name: string,
    description: string,
    picture: FileType,
    artistManager: ArtistManger,
  ) {
    const filePath = saveFile(picture);
    const artist = this.repo.create({
      name: name,
      description: description,
      picture: filePath,
      managedBy: artistManager,
    });

    return this.repo.save(artist);
  }

  async update(
    id: string,
    attributes: Partial<Artist>,
    artistManager: ArtistManger,
  ) {
    const artist = await this.repo.findOne({
      where: {
        id: id,
      },
      relations: {
        managedBy: true,
      },
    });

    if (!artist) {
      throw new NotFoundException();
    }

    if (artist.managedBy.id !== artistManager.id) {
      throw new ForbiddenException();
    }

    Object.assign(artist, attributes);
    this.repo.save(artist);
  }
}

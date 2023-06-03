import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from '../artists/artist.entity';
import { Genre } from '../genres/genre.entity';
import { Album } from '../albums/album.entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  duration: number;

  @ManyToOne(() => Artist, (artist) => artist.id, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  artist: Artist;

  @OneToMany(() => Album, (album) => album.id)
  @JoinColumn()
  album: Album;

  @OneToMany(() => Artist, (artist) => artist.id)
  @JoinColumn()
  featuredArtists: Artist[];

  @ManyToMany(() => Genre, (genre) => genre.name)
  @JoinTable()
  genres: Genre[];

  @Column('date')
  releaseDate: Date;

  @Column('int')
  playCount: number;

  @Column()
  pathLossy: string;

  @Column()
  pathLossless: string;

  @Column()
  hash: string;

  @Column()
  rawHash: string;
}

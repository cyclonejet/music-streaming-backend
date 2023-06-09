import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Artist } from '../artists/artist.entity';
import { Genre } from '../genres/genre.entity';
import { Album } from '../albums/album.entity';
import { Mrs } from '../mrs/mrs.entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('float')
  duration: number;

  @ManyToOne(() => Artist, (artist) => artist.songs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  artist: Artist;

  @ManyToOne(() => Album, (album) => album.songs, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  album: Album;

  @OneToMany(() => Artist, (artist) => artist.id)
  @JoinColumn()
  featuredArtists: Artist[];

  @ManyToMany(() => Genre, (genre) => genre.name)
  @JoinTable()
  genres: Genre[];

  @Column('int', { default: 0 })
  playCount: number;

  @Column()
  pathLossy: string;

  @Column()
  pathLossless: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ nullable: true })
  rawHash: string;

  @OneToOne(() => Mrs, (mrs) => mrs.songId)
  @JoinColumn()
  mrsIndex: Mrs;
}

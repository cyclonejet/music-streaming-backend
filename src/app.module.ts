import { APP_PIPE } from '@nestjs/core';
import { MiddlewareConsumer, Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

const cookieSession = require('cookie-session');

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { ArtistManagersModule } from './artist-managers/artist-managers.module';
import { ArtistManger } from './artist-managers/artist-manager.entity';
import { AdminsModule } from './admins/admins.module';
import { Admin } from './admins/admin.entity';
import { ArtistManagerRequest } from './artist-managers/artist-manager-request.entity';
import { ArtistsModule } from './artists/artists.module';
import { AlbumsModule } from './albums/albums.module';
import { SongsModule } from './songs/songs.module';
import { Album } from './albums/album.entity';
import { Artist } from './artists/artist.entity';
import { Song } from './songs/song.entity';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/genre.entity';
import { MrsModule } from './mrs/mrs.module';
import { Mrs } from './mrs/mrs.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          // host has to be the container name of the database
          host: config.get<string>('POSTGRES_HOST'),
          port: parseInt(config.get('POSTGRES_PORT')),
          username: config.get<string>('POSTGRES_USER'),
          password: config.get<string>('POSTGRES_PASSWORD'),
          database: config.get<string>('POSTGRES_DB'),
          synchronize: true,
          entities: [
            User,
            ArtistManger,
            Admin,
            ArtistManagerRequest,
            Album,
            Artist,
            Song,
            Genre,
            Mrs,
          ],
        };
      },
    }),
    UsersModule,
    AuthModule,
    ArtistManagersModule,
    AdminsModule,
    ArtistsModule,
    AlbumsModule,
    SongsModule,
    GenresModule,
    MrsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: [this.configService.get('COOKIE_KEY')],
        }),
      )
      .forRoutes('*');
  }
}

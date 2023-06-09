import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { AppModule } from './../src/app.module';
import { ArtistManger } from '../src/artist-managers/artist-manager.entity';
import { ArtistManagerRequest } from '../src/artist-managers/artist-manager-request.entity';
import { Artist } from '../src/artists/artist.entity';
import { Admin } from '../src/admins/admin.entity';
import { deleteFile } from './lib/deleteFile';

describe('Artist (e2e)', () => {
  let app: INestApplication;

  const EMAIL = 'test@pm.me';
  const USERNAME = 'test1234';
  const PASSWORD = 'test123456';
  const SIGNUP_ROUTE = '/artist-managers/signup';
  const ADMIN_SIGNUP_ROUTE = '/admins/signup';
  const TEST_IMAGE = 'test/images/Adele_for_Vogue_in_2021.png';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
  });

  afterAll(async () => {
    const dataSource = app.get(DataSource);
    await dataSource
      .createQueryBuilder()
      .delete()
      .from(ArtistManagerRequest)
      .execute();
    await dataSource.createQueryBuilder().delete().from(ArtistManger).execute();
    await dataSource.createQueryBuilder().delete().from(Artist).execute();
    await dataSource.createQueryBuilder().delete().from(Admin).execute();
  });

  it('edits', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    const adminSignupResponse = await request(app.getHttpServer())
      .post(ADMIN_SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const adminCookie = adminSignupResponse.get('Set-Cookie');
    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${requestedResponse.body.id}`)
      .set('Cookie', adminCookie)
      .expect(200);

    const { body } = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    await request(app.getHttpServer())
      .patch(`/artists/${body.id}`)
      .set('Cookie', cookie)
      .send({ description: 'Updated.' })
      .expect(200);

    requestedResponse.body.documents.forEach((document) =>
      deleteFile(document),
    );
    deleteFile(body.picture);
  });

  it('changes profile picture', async () => {
    const res = await request(app.getHttpServer())
      .post(SIGNUP_ROUTE)
      .send({
        email: EMAIL,
        username: USERNAME,
        password: PASSWORD,
      })
      .expect(201);
    const cookie = res.get('Set-Cookie');

    const requestedResponse = await request(app.getHttpServer())
      .post('/artist-managers/request-for-verification')
      .set('Cookie', cookie)
      .field('letter', 'pls accept')
      .attach('documents', TEST_IMAGE)
      .expect(201);

    const adminSignupResponse = await request(app.getHttpServer())
      .post(ADMIN_SIGNUP_ROUTE)
      .send({ email: EMAIL, username: USERNAME, password: PASSWORD })
      .expect(201);
    const adminCookie = adminSignupResponse.get('Set-Cookie');
    await request(app.getHttpServer())
      .patch(`/artist-managers/requests/verify/${requestedResponse.body.id}`)
      .set('Cookie', adminCookie)
      .expect(200);

    const { body } = await request(app.getHttpServer())
      .post('/artists/create')
      .set('Cookie', cookie)
      .field('name', 'Adele')
      .field('description', 'Good singer.')
      .attach('picture', TEST_IMAGE)
      .expect(201);

    const imageChangeRequest = await request(app.getHttpServer())
      .post(`/artists/change-picture/${body.id}`)
      .set('Cookie', cookie)
      .attach('picture', TEST_IMAGE)
      .expect(201);

    requestedResponse.body.documents.forEach((document) =>
      deleteFile(document),
    );

    // only delete the last TEST_IMAGE that was downscaled
    deleteFile(imageChangeRequest.body.picture);
  });
});

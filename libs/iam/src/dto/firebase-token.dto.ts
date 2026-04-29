import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FirebaseTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZpcmViYXNlLWtpZCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ5b3VyLWZpcmViYXNlLXByb2plY3QiLCJlbWFpbCI6ImphbmVAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXNlcl9pZCI6ImZpcmViYXNlLXVpZC0xMjMiLCJmaXJlYmFzZSI6eyJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.signature',
    description:
      'Firebase Authentication ID token issued by the frontend after Google or Apple sign-in through Firebase Auth.',
  })
  @IsString()
  token: string;
}

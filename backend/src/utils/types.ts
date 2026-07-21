import { ResultMode, SessionStatus, UserType } from "./enums";

export type registerUserType = {
	name: string;
	email: string;
	password: string;
}

export type createRoomType = {
	_id:string;
	title: string,
	code: string,
	status: SessionStatus,
	resultMode: ResultMode
}

export interface IdecodeToken {
	userId: string
}

export interface IUserData {
	_id: string;
	name: string;
	email: string;
}

export interface IGuestData {
	_id: string;
	name: string;
	expiresAt: Date;
}

export type sockertUserReq = {
	_id: string;
	name: string;
	email: string;
	type: UserType;
	sessionId:string;
}

export type RoomType = createRoomType & { startedAt:Date,createdByType:UserType  }


export type SocketResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
    }
  | {
      success: false;
      message: string;
      data: null;
    };
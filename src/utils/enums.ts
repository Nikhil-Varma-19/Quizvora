export enum UserType {
	User = "User",
	Guest = "Guest",
}

export enum ModePlay {
	live = "live",
	predefined = "predefined"
}

export enum SessionStatus {
	Waiting = "waiting",
	Running = "running",
	Paused = "paused",
	Ended = "ended",
}

export enum Role {
	Admin = "admin",
	Member = "member"
}

export enum ResultMode {
	PerQuestion = "perQuestion",
	AtLast = "atLast"
}

export enum TypeQuestion {
	Mcq = "mcq",
	Written = "written"
}


export enum QuestionStatus {
	Complete = "complete",
	Ongoing = "ongoing",
	Pending = "pending" 
}

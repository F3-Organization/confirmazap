import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from "typeorm";
import { User } from "./user.entity";
import { Schedule } from "./schedule.entity";

@Entity("clients")
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    email?: string;

    @Column()
    phone!: string;

    @Column({ name: "user_id" })
    userId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => Schedule, (schedule) => schedule.client)
    schedules?: Schedule[];

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt!: Date;
}

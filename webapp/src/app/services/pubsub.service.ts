import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, map, Observable, ReplaySubject } from 'rxjs';
import { NewSubscriptionRequest } from '../components/subscription-list/new-subscription-dialog/new-subscription-dialog.component';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PubsubService {
  private http = inject(HttpClient);
  private baseUrl = environment.pubsubEmulator.host;

  public _currentHost$ = new BehaviorSubject<string>(this.baseUrl)

  private _projectList = new BehaviorSubject<string[]>([environment.pubsubEmulator.projectId])
  private _currentProject = new ReplaySubject<string>()
  private _currentTopic = new ReplaySubject<Topic>()
  private _currentSubscription = new ReplaySubject<Subscription>()

  public projectList$ = this._projectList.asObservable()
  public currentProject$ = this._currentProject.asObservable()
  public topicList$: Observable<Topic[]> = EMPTY
  public currentTopic$ = this._currentTopic.asObservable()
  public currentSubscription$ = this._currentSubscription.asObservable()

  private getApiUrl(path: string): string {
    const cleanPath = path.replace(/^\/+/, '');
    return `${this.baseUrl}/proxy/v1/${cleanPath}`;
  }

  constructor() {
    const prevHost = localStorage.getItem("host")
    if (prevHost) {
      console.log('loaded previous host', prevHost)
      this._currentHost$.next(prevHost)
      this.baseUrl = prevHost
    }

    const prevProjects = localStorage.getItem("projects") ?? "[]"
    const projects: string[] = JSON.parse(prevProjects) ?? []
    if (projects.length === 0) {
      // Add default project from environment
      this._projectList.next([environment.pubsubEmulator.projectId])
      localStorage.setItem("projects", JSON.stringify([environment.pubsubEmulator.projectId]))
    } else {
      this._projectList.next(projects)
    }

    this.currentProject$.subscribe(project =>
      this.topicList$ = this.listTopics(project)
    )
  }

  setHost(hostUrl: string) {
    this._currentHost$.next(hostUrl)
    this.baseUrl = hostUrl
    localStorage.setItem("host", hostUrl)
  }

  selectProject(projectId: string) {
    this._currentProject.next(projectId)
  }

  attachProject(newProject: string) {
    const newList = this._projectList.getValue()
    newList.push(newProject)
    this._projectList.next(newList)
    localStorage.setItem("projects", JSON.stringify(newList))
  }

  createTopic(projectId: string, topicId: string) {
    const url = this.getApiUrl(`projects/${projectId}/topics/${topicId}`)
    return this.http.put<Topic>(url, {})
  }

  listTopics(projectId: string) {
    const url = this.getApiUrl(`projects/${projectId}/topics`)
    console.log('Fetching topics from:', url);
    return this.http.get<{ topics: Topic[] }>(url).pipe(
      map(incoming => {
        console.log('Topics response:', incoming);
        return incoming?.topics || [];
      })
    )
  }

  createSubscription(projectId: string, request: NewSubscriptionRequest) {
    const url = this.getApiUrl(`projects/${projectId}/subscriptions/${request.name}`)
    return this.http.put<Subscription>(url, { topic: request.topic, pushConfig: request.pushConfig })
  }

  deleteSubscription(subscriptionPath: string) {
    const url = this.getApiUrl(subscriptionPath)
    return this.http.delete(url)
  }

  listSubscriptions(projectId: string): Observable<Subscription[]> {
    const url = this.getApiUrl(`projects/${projectId}/subscriptions`)
    return this.http.get<{ subscriptions?: string[] }>(url)
      .pipe(
        map(incoming => incoming.subscriptions),
        map(subNames => subNames ?? []),
        map(subNames => subNames.map(name => ({ name, topic: 'undefined' } as Subscription)))
      )
  }

  listSubscriptionsOnTopic(topicPath: string): Observable<Subscription[]> {
    console.log('looking up subscriptions on', topicPath)
    const url = this.getApiUrl(`${topicPath}/subscriptions`)
    console.log('request url', url)
    return this.http.get<{ subscriptions?: string[] }>(url)
      .pipe(
        map(incoming => incoming.subscriptions),
        map(subNames => subNames ?? []),
        map(subNames => subNames.map(name => ({ name, topic: 'undefined' } as Subscription)))
      )
  }

  getSubscriptionDetails(subscriptionPath: string) {
    const url = this.getApiUrl(subscriptionPath)
    return this.http.get<Subscription>(url)
  }

  fetchMessages(subPath: string, maxMessages: number) {
    const url = this.getApiUrl(`${subPath}:pull`);
    console.log('Pulling messages from:', url, { maxMessages });
    return this.http
      .post<{ receivedMessages: ReceivedMessage[] }>(
        url,
        { returnImmediately: true, maxMessages }
      ).pipe(
        map(incoming => {
          console.log('Pull response:', incoming);
          return incoming.receivedMessages ?? [];
        })
      );
  }

  ackMessage(subscriptionPath: string, ackIds: string[]) {
    const url = this.getApiUrl(`${subscriptionPath}:acknowledge`)
    return this.http.post(url, { ackIds })
  }

  publishMessages(topicPath: string, messages: PubsubMessage[]) {
    const url = this.getApiUrl(`${topicPath}:publish`)
    return this.http.post<{ messageIds: string[] }>(url, { messages })
  }
}

export interface Topic {
  name: string
  labels: { [key: string]: string }
}

export interface Subscription {
  name: string
  topic: string
}

export interface ReceivedMessage {
  ackId: string
  message: PubsubMessage
  deliveryAttempt: number
}

export interface PubsubMessage {
  data: string 
  attributes?: { [key: string]: string }
  messageId?: string
  publishTime?: string
  orderingKey?: string
}

export interface PushConfig {
  pushEndpoint: string
  attributes?: { [key: string]: string }
}

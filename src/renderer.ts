import { HostConfig } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import { createContext } from "react";
import StreamDeckButtonInstance from "./elements/StreamDeckButtonInstance";
import StreamDeckInstance from "./elements/StreamDeckInstance";
import type { StreamDeckContainer, StreamDeckElements } from "./types";

type Type = "stream-deck" | "stream-deck-button";
type Props =
  | StreamDeckElements["stream-deck"]
  | StreamDeckElements["stream-deck-button"];
type Container = StreamDeckContainer;
type Instance = StreamDeckInstance | StreamDeckButtonInstance;
type TextInstance = undefined;
type SuspenseInstance = Instance;
type HydratableInstance = undefined;
type FormInstance = null;
type PublicInstance = Instance;
type HostContext = "deck" | "stream-deck" | "stream-deck-button";
type ChildSet = { deck?: StreamDeckInstance };
type TimeoutHandle = NodeJS.Timeout;
type NoTimeout = -1;
type TransitionStatus = null;

const DEBUG = process.env.DEBUG || false;

function computeUpdatePayload(
  oldProps: Props,
  newProps: Props,
): { [key: string]: any } {
  const payload: { [key: string]: any } = {};
  const oldP = oldProps as Record<string, unknown>;
  const newP = newProps as Record<string, unknown>;

  for (const key in oldProps) {
    if (
      newP.hasOwnProperty(key) ||
      !oldP.hasOwnProperty(key) ||
      oldP[key] == null
    )
      continue;
    payload[key] = undefined;
  }

  for (const key in newProps) {
    const newProp = newP[key];
    const oldProp = oldP[key];
    if (
      !newP.hasOwnProperty(key) ||
      newProp === oldProp ||
      (newProp == null && oldProp == null)
    )
      continue;
    payload[key] = newProp;
  }

  return payload;
}

export const renderer: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  FormInstance,
  PublicInstance,
  HostContext,
  ChildSet,
  TimeoutHandle,
  NoTimeout,
  TransitionStatus
> = {
  supportsMutation: false,
  supportsPersistence: true,
  createInstance(type, props, rootContainer, hostContext, _internalHandle) {
    DEBUG && console.log("createInstance", type, props);
    switch (type) {
      case "stream-deck":
        return new StreamDeckInstance(
          props as StreamDeckElements["stream-deck"],
        );
      case "stream-deck-button": {
        const p = props as StreamDeckElements["stream-deck-button"];
        return new StreamDeckButtonInstance(p, p.position);
      }
      default:
        throw Error(`Unsupported type: ${type}`);
    }
  },
  createTextInstance(text, rootContainer, hostContext, internalHandle) {
    throw Error("Text nodes are not supported.");
  },
  appendInitialChild(parentInstance, child) {
    DEBUG && console.log("appendInitialChild", child);
    if (
      parentInstance instanceof StreamDeckInstance &&
      child instanceof StreamDeckButtonInstance
    ) {
      if (child.props.position === undefined) {
        child.index = parentInstance.buttons.size;
      }
      parentInstance.addButton(child);
    }
  },
  finalizeInitialChildren(instance, type, props, rootContainer, hostContext) {
    DEBUG && console.log("finalizeInitialChildren");
    return false;
  },
  commitUpdate(instance, type, prevProps, nextProps, internalHandle): void {
    DEBUG && console.log("commitUpdate", instance, type);
    const updatePayload = computeUpdatePayload(prevProps, nextProps);
    instance.update(updatePayload);
  },
  shouldSetTextContent(type, props) {
    return false;
  },
  getRootHostContext(rootContainer) {
    DEBUG && console.log("getRootHostContext => deck");
    return "deck";
  },
  getChildHostContext(parentHostContext, type, rootContainer) {
    DEBUG && console.log(`getChildHostContext for ${type}`);
    switch (type) {
      case "stream-deck-button":
        return "stream-deck-button";
      default:
        return parentHostContext;
    }
  },
  getPublicInstance(instance) {
    DEBUG && console.log("getPublicInstance");
    if (instance === undefined) {
      throw Error("Text nodes are not supported.");
    }
    return instance;
  },
  prepareForCommit(containerInfo) {
    DEBUG && console.log("prepareForCommit => null");
    return null;
  },
  resetAfterCommit(containerInfo) {
    DEBUG && console.log("resetAfterCommit => void");
  },
  preparePortalMount(containerInfo) {
    DEBUG && console.log("preparePortalMount");
  },
  scheduleTimeout(fn, delay) {
    DEBUG && console.log("scheduleTimeout");
    return setTimeout(fn, delay);
  },
  cancelTimeout(id) {
    DEBUG && console.log("cancelTimeout");
    clearTimeout(id);
  },
  noTimeout: -1,
  supportsMicrotasks: false,
  scheduleMicrotask(fn) {},
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  setCurrentUpdatePriority(newPriority) {},
  getCurrentUpdatePriority() {
    DEBUG && console.log("getCurrentUpdatePriority");
    return DefaultEventPriority;
  },
  resolveUpdatePriority() {
    return DefaultEventPriority;
  },
  getInstanceFromNode(node) {
    DEBUG && console.log("getInstanceFromNode");
    return undefined;
  },
  beforeActiveInstanceBlur() {
    DEBUG && console.log("beforeActiveInstanceBlur");
  },
  afterActiveInstanceBlur() {
    DEBUG && console.log("afterActiveInstanceBlur");
  },
  prepareScopeUpdate(scopeInstance, instance) {
    DEBUG && console.log("prepareScopeUpdate");
  },
  getInstanceFromScope(scopeInstance) {
    DEBUG && console.log("getInstanceFromScope");
    return null;
  },
  detachDeletedInstance(node) {
    DEBUG && console.log("detachDeletedInstance");
    node.unmount();
  },
  supportsHydration: false,
  cloneInstance(
    instance,
    type,
    oldProps,
    newProps,
    keepChildren,
    recyclableInstance,
  ) {
    DEBUG && console.log("cloneInstance");
    const updatePayload = computeUpdatePayload(oldProps, newProps);

    if (instance instanceof StreamDeckInstance) {
      // Must return a NEW object: React's persistence reconciler compares
      // WIP.stateNode !== current.stateNode to know it must rebuild children.
      // Returning the same instance causes React to skip appendInitialChild
      // when keepChildren=false, leaving buttons empty after clearButtons().
      const clone = new StreamDeckInstance({ ...instance.props, ...updatePayload });
      if (keepChildren) {
        instance.buttons.forEach((button, index) => {
          clone.buttons.set(index, button);
        });
      }
      return clone;
    }

    // Buttons: reuse the same instance so event listeners aren't leaked.
    instance.update(updatePayload);
    return instance;
  },
  createContainerChildSet(container) {
    DEBUG && console.log("createContainerChildSet => {}");
    return {};
  },
  appendChildToContainerChildSet(childSet, child) {
    DEBUG && console.log("appendChildToContainerChildSet");
    if (child instanceof StreamDeckInstance) {
      childSet.deck = child;
    }
  },
  finalizeContainerChildren(container, newChildren) {
    DEBUG && console.log("finalizeContainerChildren => void");
  },
  replaceContainerChildren(container, newChildren) {
    DEBUG && console.log("replaceContainerChildren");
    newChildren.deck?.render(container);
  },
  cloneHiddenInstance(instance, type, props, internalInstanceHandle) {
    DEBUG && console.log("cloneHiddenInstance");
    // @todo
    return instance;
  },
  cloneHiddenTextInstance(instance, text, internalInstanceHandle) {
    throw Error("Text nodes are not supported.");
  },
  // New React 19 required members
  NotPendingTransition: null,
  HostTransitionContext: createContext<TransitionStatus>(null) as any,
  resetFormInstance(form) {},
  requestPostPaintCallback(callback) {},
  shouldAttemptEagerTransition() {
    return false;
  },
  trackSchedulerEvent() {},
  resolveEventType() {
    return null;
  },
  resolveEventTimeStamp() {
    return -1;
  },
  maySuspendCommit(type, props) {
    return false;
  },
  preloadInstance(type, props) {
    return true;
  },
  startSuspendingCommit() {},
  suspendInstance(type, props) {},
  waitForCommitToBeReady() {
    return null;
  },
};

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
    DEBUG && console.log("[renderer] createInstance", type, props);
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
    DEBUG && console.log("[renderer] appendInitialChild", child);
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
    DEBUG && console.log("[renderer] finalizeInitialChildren");
    return false;
  },
  commitUpdate(instance, type, prevProps, nextProps, internalHandle): void {
    DEBUG && console.log("[renderer] commitUpdate", instance, type);
    const updatePayload = computeUpdatePayload(prevProps, nextProps);
    instance.update(updatePayload);
  },
  shouldSetTextContent(type, props) {
    return false;
  },
  getRootHostContext(rootContainer) {
    DEBUG && console.log("[renderer] getRootHostContext => deck");
    return "deck";
  },
  getChildHostContext(parentHostContext, type, rootContainer) {
    DEBUG && console.log(`[renderer] getChildHostContext for ${type}`);
    switch (type) {
      case "stream-deck-button":
        return "stream-deck-button";
      default:
        return parentHostContext;
    }
  },
  getPublicInstance(instance) {
    DEBUG && console.log("[renderer] getPublicInstance");
    if (instance === undefined) {
      throw Error("Text nodes are not supported.");
    }
    return instance;
  },
  prepareForCommit(containerInfo) {
    DEBUG && console.log("[renderer] prepareForCommit => null");
    return null;
  },
  resetAfterCommit(containerInfo) {
    DEBUG && console.log("[renderer] resetAfterCommit => void");
  },
  preparePortalMount(containerInfo) {
    DEBUG && console.log("[renderer] preparePortalMount");
  },
  scheduleTimeout(fn, delay) {
    DEBUG && console.log("[renderer] scheduleTimeout");
    return setTimeout(fn, delay);
  },
  cancelTimeout(id) {
    DEBUG && console.log("[renderer] cancelTimeout");
    clearTimeout(id);
  },
  noTimeout: -1,
  supportsMicrotasks: true,
  scheduleMicrotask: queueMicrotask,
  isPrimaryRenderer: true,
  warnsIfNotActing: true,
  setCurrentUpdatePriority(newPriority) {},
  getCurrentUpdatePriority() {
    DEBUG && console.log("[renderer] getCurrentUpdatePriority");
    return DefaultEventPriority;
  },
  resolveUpdatePriority() {
    return DefaultEventPriority;
  },
  getInstanceFromNode(node) {
    DEBUG && console.log("[renderer] getInstanceFromNode");
    return undefined;
  },
  beforeActiveInstanceBlur() {
    DEBUG && console.log("[renderer] beforeActiveInstanceBlur");
  },
  afterActiveInstanceBlur() {
    DEBUG && console.log("[renderer] afterActiveInstanceBlur");
  },
  prepareScopeUpdate(scopeInstance, instance) {
    DEBUG && console.log("[renderer] prepareScopeUpdate");
  },
  getInstanceFromScope(scopeInstance) {
    DEBUG && console.log("[renderer] getInstanceFromScope");
    return null;
  },
  detachDeletedInstance(node) {
    DEBUG && console.log("[renderer] detachDeletedInstance");
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
    DEBUG && console.log("[renderer] cloneInstance");
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

    // Return a new instance so React sees WIP.stateNode !== current.stateNode
    // and propagates the change up to the parent (stream-deck).
    // unmount() removes the old instance's stream deck event listeners before
    // the new instance registers its own in render().
    instance.unmount();
    return new StreamDeckButtonInstance(
      { ...instance.props, ...updatePayload },
      instance.index,
    );
  },
  createContainerChildSet(container) {
    DEBUG && console.log("[renderer] createContainerChildSet => {}");
    return {};
  },
  appendChildToContainerChildSet(childSet, child) {
    DEBUG && console.log("[renderer] appendChildToContainerChildSet");
    if (child instanceof StreamDeckInstance) {
      childSet.deck = child;
    }
  },
  finalizeContainerChildren(container, newChildren) {
    DEBUG && console.log("[renderer] finalizeContainerChildren => void");
  },
  replaceContainerChildren(container, newChildren) {
    DEBUG && console.log("[renderer] replaceContainerChildren");
    newChildren.deck?.render(container);
  },
  cloneHiddenInstance(instance, type, props, internalInstanceHandle) {
    DEBUG && console.log("[renderer] cloneHiddenInstance");
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

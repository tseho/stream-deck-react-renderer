import { HostConfig } from "react-reconciler";
import { DefaultEventPriority } from "react-reconciler/constants";
import LcdKeyInstance from "./elements/LcdKeyInstance";
import type { StreamDeckContainer, StreamDeckElements } from "./types";

type Type = "lcdKey";
type Props = StreamDeckElements["lcdKey"];
type Container = StreamDeckContainer;
type Instance = LcdKeyInstance;
type TextInstance = undefined;
type SuspenseInstance = Instance;
type HydratableInstance = undefined;
type PublicInstance = Instance;
type HostContext = "deck" | "lcdKey";
type UpdatePayload = { [key: string]: any };
type ChildSet = { [index: number]: Instance };
type TimeoutHandle = NodeJS.Timeout;
type NoTimeout = -1;

const DEBUG = process.env.DEBUG || false;

export const renderer: HostConfig<
  Type,
  Props,
  Container,
  Instance,
  TextInstance,
  SuspenseInstance,
  HydratableInstance,
  PublicInstance,
  HostContext,
  UpdatePayload,
  ChildSet,
  TimeoutHandle,
  NoTimeout
> = {
  supportsMutation: false,
  supportsPersistence: true,
  createInstance(type, props, rootContainer, hostContext, internalHandle) {
    DEBUG && console.log("createInstance", type, props);
    switch (type) {
      case "lcdKey":
        return new LcdKeyInstance(
          props,
          props.position ?? internalHandle.index,
        );
      default:
        throw Error(`Unsupported type: ${type}`);
    }
  },
  createTextInstance(text, rootContainer, hostContext, internalHandle) {
    throw Error("Text nodes are not supported.");
  },
  appendInitialChild(parentInstance, child) {
    // @todo
    DEBUG && console.log("appendInitialChild", child);
  },
  finalizeInitialChildren(instance, type, props, rootContainer, hostContext) {
    DEBUG && console.log("finalizeInitialChildren");
    return false;
  },
  /**
   * React calls this method so that you can compare the previous and the next props,
   * and decide whether you need to update the underlying instance or not.
   * If you don't need to update it, return `null`. If you need to update it,
   * you can return an arbitrary object representing the changes that need to happen.
   * Then in `commitUpdate` you would need to apply those changes to the instance.
   *
   * This method happens **in the render phase**. It should only *calculate* the update
   * — but not apply it! For example, the DOM renderer returns an array
   * that looks like `[prop1, value1, prop2, value2, ...]` for all props that have
   * actually changed. And only in `commitUpdate` it applies those changes.
   * You should calculate as much as you can in `prepareUpdate` so that `commitUpdate`
   * can be very fast and straightforward.
   *
   * See the meaning of `rootContainer` and `hostContext` in the `createInstance` documentation.
   */
  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainer,
    hostContext,
  ) {
    let updatePayload: UpdatePayload | null = null;

    for (let key in oldProps) {
      if (
        newProps.hasOwnProperty(key) ||
        !oldProps.hasOwnProperty(key) ||
        oldProps[key] == null
      ) {
        continue;
      }

      (updatePayload = updatePayload || {})[key] = undefined;
    }

    for (let key in newProps) {
      const newProp = newProps[key];
      const oldProp = oldProps != null ? oldProps[key] : undefined;

      if (
        !newProps.hasOwnProperty(key) ||
        newProp === oldProp ||
        (newProp == null && oldProp == null)
      ) {
        continue;
      }

      (updatePayload = updatePayload || {})[key] = newProp;
    }

    DEBUG &&
      console.log(
        "prepareUpdate",
        instance,
        type,
        oldProps,
        newProps,
        updatePayload,
      );

    return updatePayload;
  },
  /**
   * This method should mutate the `instance` according to the set of changes in `updatePayload`.
   * Here, `updatePayload` is the object that you've returned from `prepareUpdate`
   * and has an arbitrary structure that makes sense for your renderer.
   * For example, the DOM renderer returns an update payload like `[prop1, value1, prop2, value2, ...]`
   * from `prepareUpdate`, and that structure gets passed into `commitUpdate`.
   * Ideally, all the diffing and calculation should happen inside `prepareUpdate`
   * so that `commitUpdate` can be fast and straightforward.
   *
   * The `internalHandle` data structure is meant to be opaque.
   * If you bend the rules and rely on its internal fields,
   * be aware that it may change significantly between versions.
   * You're taking on additional maintenance risk by reading from it,
   * and giving up all guarantees if you write something to it.
   */
  commitUpdate(
    instance,
    updatePayload,
    type,
    prevProps,
    nextProps,
    internalHandle,
  ): void {
    DEBUG && console.log("commitUpdate", instance, type, updatePayload);

    instance.update(updatePayload);
  },
  shouldSetTextContent(type, props) {
    return false;
  },
  /**
   * This method lets you return the initial host context from the root of the tree.
   *
   * Host context lets you track some information about where you are in the tree
   * so that it's available inside `createInstance` as the `hostContext` parameter.
   * For example, the DOM renderer uses it to track whether it's inside an HTML
   * or an SVG tree, because `createInstance` implementation needs to be
   * different for them.
   */
  getRootHostContext(rootContainer) {
    DEBUG && console.log("getRootHostContext => deck");
    return "deck";
  },
  /**
   * Host context lets you track some information about where you are in the tree
   * so that it's available inside `createInstance` as the `hostContext` parameter.
   * For example, the DOM renderer uses it to track whether it's inside an HTML
   * or an SVG tree, because `createInstance` implementation needs to be
   * different for them.
   */
  getChildHostContext(parentHostContext, type, rootContainer) {
    DEBUG && console.log(`getChildHostContext for ${type}`);
    switch (type) {
      case "lcdKey":
        return "lcdKey";
      default:
        return parentHostContext;
    }
  },
  getPublicInstance(instance) {
    DEBUG && console.log("getPublicInstance");
    return instance;
  },
  /**
   * This method lets you store some information before React starts making changes
   * to the tree on the screen. For example, the DOM renderer stores the current
   * text selection so that it can later restore it. This method is mirrored
   * by `resetAfterCommit`.
   */
  prepareForCommit(containerInfo) {
    DEBUG && console.log("prepareForCommit => null");
    return null;
  },
  /**
   * This method is called right after React has performed the tree mutations.
   * You can use it to restore something you've stored in `prepareForCommit` —
   * for example, text selection.
   */
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
  getCurrentEventPriority() {
    DEBUG && console.log("getCurrentEventPriority");
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
  /**
   * This method should mutate the `instance` according to the set of changes
   * in `updatePayload`. Here, `updatePayload` is the object that you've returned
   * from `prepareUpdate` and has an arbitrary structure that makes sense for
   * your renderer. For example, the DOM renderer returns an update payload
   * like `[prop1, value1, prop2, value2, ...]` from `prepareUpdate`, and
   * that structure gets passed into `commitUpdate`. Ideally, all the diffing
   * and calculation should happen inside `prepareUpdate` so that `commitUpdate`
   * can be fast and straightforward.
   *
   * The `internalHandle` data structure is meant to be opaque.
   * If you bend the rules and rely on its internal fields, be aware that
   * it may change significantly between versions. You're taking on additional
   * maintenance risk by reading from it, and giving up all guarantees if you
   * write something to it.
   */
  cloneInstance(
    instance,
    updatePayload,
    type,
    oldProps,
    newProps,
    internalInstanceHandle,
    keepChildren,
    recyclableInstance,
  ) {
    DEBUG && console.log("cloneInstance");
    instance.update(updatePayload);
    return instance;
  },
  createContainerChildSet(container) {
    DEBUG && console.log("createContainerChildSet => {}");
    return {};
  },
  appendChildToContainerChildSet(childSet, child) {
    DEBUG && console.log("appendChildToContainerChildSet");
    childSet[child.index] = child;
  },
  finalizeContainerChildren(container, newChildren) {
    DEBUG && console.log("finalizeContainerChildren => void");
  },
  replaceContainerChildren(container, newChildren) {
    DEBUG && console.log("replaceContainerChildren");

    for (let index = 0; index < container.NUM_KEYS; index++) {
      const lcdKey = newChildren[index];

      if (lcdKey === undefined) {
        container.fillKeyColor(index, 0, 0, 0);
        continue;
      }

      lcdKey.render(container);
    }
  },
  cloneHiddenInstance(instance, type, props, internalInstanceHandle) {
    DEBUG && console.log("cloneHiddenInstance");
    // @todo
    return instance;
  },
  cloneHiddenTextInstance(instance, text, internalInstanceHandle) {
    throw Error("Text nodes are not supported.");
  },
};
